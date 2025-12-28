from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
from rapidfuzz import fuzz, process
import io
import re
import os
from datetime import datetime
from typing import Dict, List, Tuple, Optional

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Enable CORS for Netlify frontend
CORS(app, resources={
    r"/*": {
        "origins": ["*"],  # In production, restrict to your Netlify domain
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

# BBM column mapping - includes optional 3PT support
BBM_COLUMNS = {
    'PTS': 'p',
    'REB': 'r',
    'AST': 'a',
    'STL': 's',
    'BLK': 'b',
    'TO': 'to',
    '3PT': '3',      # 3-pointers - column may not exist in all BBM files
    '3PM': '3',      # Alternative name for 3-pointers
    'FG3M': 'fg3m',  # Another alternative
}

# Site names mapping
SITE_NAMES = {
    'prizepicks': 'PrizePicks',
    'underdog': 'Underdog',
    'pick6': 'Pick6',
    'sleeper': 'Sleeper',
    'fanduel': 'FanDuel'
}

def parse_market_to_bbm_columns(market: str, available_bbm_cols: set = None) -> Tuple[List[str], str]:
    """
    Parse market name to BBM column names.
    Returns: (columns, reason) - columns list and reason if empty

    Examples: 'PTS+REB+AST' -> (['p', 'r', 'a'], '')
              'Points' -> (['p'], '')
              '3PT Made' -> (['3'], '') or ([], 'no BBM column')
    """
    market_upper = market.upper().strip()

    # Skip markets we can't calculate
    skip_markets = ['DOUBLE DOUBLE', 'TRIPLE DOUBLE', 'DD', 'TD']
    for skip in skip_markets:
        if skip in market_upper:
            return [], f'cannot calculate {market}'

    # Direct mappings for single stats (full names and abbreviations)
    direct_mappings = {
        'POINTS': ['p'],
        'PTS': ['p'],
        'REBOUNDS': ['r'],
        'REB': ['r'],
        'ASSISTS': ['a'],
        'AST': ['a'],
        'STEALS': ['s'],
        'STL': ['s'],
        'BLOCKS': ['b'],
        'BLK': ['b'],
        'TURNOVERS': ['to'],
        'TO': ['to'],
        '3PT MADE': ['3'],
        '3-PT MADE': ['3'],
        '3-POINTERS MADE': ['3'],
        '3PM': ['3'],
        '3PT': ['3'],
        'THREE POINTERS': ['3'],
        'THREES': ['3'],
    }

    # Check for direct match first
    if market_upper in direct_mappings:
        columns = direct_mappings[market_upper]
        # Check if BBM has the required column
        if available_bbm_cols:
            for col in columns:
                if col not in available_bbm_cols:
                    return [], f'BBM missing column: {col}'
        return columns, ''

    # For combo stats, we need to map full words AND abbreviations
    # e.g., "PTS+REB+AST" or "Points+Rebounds+Assists"
    stat_mappings = {
        # Abbreviations
        'PTS': 'p',
        'REB': 'r',
        'AST': 'a',
        'STL': 's',
        'BLK': 'b',
        'TO': 'to',
        '3PT': '3',
        '3PM': '3',
        # Full words (checked after abbreviations to avoid substring issues)
        'POINTS': 'p',
        'REBOUNDS': 'r',
        'ASSISTS': 'a',
        'STEALS': 's',
        'BLOCKS': 'b',
        'TURNOVERS': 'to',
    }

    # Split by common delimiters and check each part
    parts = re.split(r'[+/\s]+', market_upper)
    columns = []

    for part in parts:
        part = part.strip()
        if part in stat_mappings:
            col = stat_mappings[part]
            if col not in columns:
                columns.append(col)

    # If splitting didn't work, try substring matching (but be careful)
    if not columns:
        # Use word boundaries to avoid false matches
        for stat, col in stat_mappings.items():
            # Create pattern that matches whole word or at boundary
            pattern = r'(?:^|[^A-Z])' + re.escape(stat) + r'(?:$|[^A-Z])'
            if re.search(pattern, market_upper) or market_upper == stat:
                if col not in columns:
                    columns.append(col)

    if not columns:
        return [], f'unrecognized market format: {market}'

    # Check if BBM has all required columns
    if available_bbm_cols:
        missing = [col for col in columns if col not in available_bbm_cols]
        if missing:
            return [], f'BBM missing columns: {missing}'

    return columns, ''


def calculate_bbm_projection(bbm_row: pd.Series, columns: List[str]) -> Optional[float]:
    """Calculate BBM projection by summing specified columns."""
    try:
        total = 0
        for col in columns:
            value = bbm_row.get(col, 0)
            if pd.isna(value):
                return None
            total += float(value)
        return total
    except (ValueError, TypeError):
        return None


def fuzzy_match_player(player_name: str, bbm_names: List[str], threshold: int = 85) -> Optional[str]:
    """Find best fuzzy match for player name in BBM data."""
    if not player_name or not bbm_names:
        return None

    result = process.extractOne(
        player_name,
        bbm_names,
        scorer=fuzz.ratio,
        score_cutoff=threshold
    )

    return result[0] if result else None


def extract_date_from_filename(filename: str) -> Optional[str]:
    """Extract date from filename like 'rw-prizepicks-predictions-2024-01-15.csv'"""
    match = re.search(r'(\d{4}-\d{2}-\d{2})', filename)
    return match.group(1) if match else None


def read_file(file) -> pd.DataFrame:
    """Read CSV or Excel file into DataFrame."""
    filename = file.filename.lower()

    if filename.endswith('.csv'):
        return pd.read_csv(file)
    elif filename.endswith(('.xls', '.xlsx')):
        return pd.read_excel(file)
    else:
        raise ValueError(f"Unsupported file format: {filename}")


def filter_nba_data(df: pd.DataFrame) -> pd.DataFrame:
    """Filter for NBA data if Sport column exists."""
    if 'Sport' in df.columns:
        return df[df['Sport'].str.upper() == 'NBA'].copy()
    return df.copy()


def normalize_bbm_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize BBM column names to expected format.
    Handles various BBM file formats.
    """
    # Column name mappings (various possible names -> standard name)
    column_mappings = {
        # Name column
        'Name': 'Name',
        'Player': 'Name',
        'player': 'Name',
        'name': 'Name',
        'PLAYER': 'Name',
        'NAME': 'Name',
        'full_name': 'Name',
        'Full_Name': 'Name',
        'FullName': 'Name',
        'fullname': 'Name',
        # Points
        'p': 'p',
        'P': 'p',
        'PTS': 'p',
        'pts': 'p',
        'Points': 'p',
        'points': 'p',
        'POINTS': 'p',
        # Rebounds
        'r': 'r',
        'R': 'r',
        'REB': 'r',
        'reb': 'r',
        'Rebounds': 'r',
        'rebounds': 'r',
        'TRB': 'r',
        'trb': 'r',
        'REBOUNDS': 'r',
        # Assists
        'a': 'a',
        'A': 'a',
        'AST': 'a',
        'ast': 'a',
        'Assists': 'a',
        'assists': 'a',
        'ASSISTS': 'a',
        # Steals
        's': 's',
        'S': 's',
        'STL': 's',
        'stl': 's',
        'Steals': 's',
        'steals': 's',
        'STEALS': 's',
        # Blocks
        'b': 'b',
        'B': 'b',
        'BLK': 'b',
        'blk': 'b',
        'Blocks': 'b',
        'blocks': 'b',
        'BLOCKS': 'b',
        # Turnovers
        'to': 'to',
        'TO': 'to',
        'TOV': 'to',
        'tov': 'to',
        'Turnovers': 'to',
        'turnovers': 'to',
        'TURNOVERS': 'to',
        # 3-pointers
        '3': '3',
        '3PT': '3',
        '3pt': '3',
        '3PM': '3',
        '3pm': '3',
        'FG3M': '3',
        'fg3m': '3',
        'FG3': '3',
        'fg3': '3',
        'Three': '3',
        'Threes': '3',
        'threes': '3',
        '3P': '3',
    }

    # Rename columns based on mappings
    new_columns = {}
    for col in df.columns:
        if col in column_mappings:
            new_columns[col] = column_mappings[col]

    if new_columns:
        df = df.rename(columns=new_columns)

    return df


def normalize_site_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize site file column names to expected format.
    Handles various site file formats (RotoWire, etc.)
    """
    column_mappings = {
        # Player column
        'Player': 'Player',
        'player': 'Player',
        'PLAYER': 'Player',
        'Name': 'Player',
        'name': 'Player',
        'PlayerName': 'Player',
        'Player Name': 'Player',
        'player_name': 'Player',
        # Market column
        'Market': 'Market',
        'market': 'Market',
        'MARKET': 'Market',
        'Market Name': 'Market',
        'market_name': 'Market',
        'MarketName': 'Market',
        'Prop': 'Market',
        'prop': 'Market',
        'Stat': 'Market',
        'stat': 'Market',
        # Line column
        'Line': 'Line',
        'line': 'Line',
        'LINE': 'Line',
        'Over/Under': 'Line',
        'OU': 'Line',
        'Projection': 'Line',
        'projection': 'Line',
        'Target': 'Line',
        'target': 'Line',
    }

    new_columns = {}
    for col in df.columns:
        if col in column_mappings:
            new_columns[col] = column_mappings[col]

    if new_columns:
        df = df.rename(columns=new_columns)

    return df


def calculate_edges_for_site(site_df: pd.DataFrame, bbm_df: pd.DataFrame, site_name: str, debug: bool = False) -> Tuple[List[Dict], Dict]:
    """
    Calculate edges for a single site.
    Returns: (edges, debug_info)
    """
    edges = []
    bbm_names = bbm_df['Name'].tolist()

    # Create BBM lookup dictionary
    bbm_lookup = {row['Name']: row for _, row in bbm_df.iterrows()}

    # Get available BBM columns for validation
    available_bbm_cols = set(bbm_df.columns.tolist())

    # Debug info
    debug_info = {
        'total_rows': len(site_df),
        'markets_in_file': {},
        'markets_parsed': {},
        'markets_failed': {},
        'player_match_failed': 0,
        'projection_failed': 0,
        'edges_by_market': {},
    }

    # Count markets in file
    for _, row in site_df.iterrows():
        market = row.get('Market', '')
        if market:
            debug_info['markets_in_file'][market] = debug_info['markets_in_file'].get(market, 0) + 1

    for _, row in site_df.iterrows():
        player_name = row.get('Player', '')
        market = row.get('Market', '')
        line = row.get('Line', None)

        if not player_name or not market or pd.isna(line):
            continue

        # Fuzzy match player name
        matched_name = fuzzy_match_player(player_name, bbm_names)
        if not matched_name:
            debug_info['player_match_failed'] += 1
            continue

        # Parse market to BBM columns (with validation)
        bbm_columns, fail_reason = parse_market_to_bbm_columns(market, available_bbm_cols)
        if not bbm_columns:
            debug_info['markets_failed'][market] = fail_reason
            continue

        # Track successfully parsed markets
        debug_info['markets_parsed'][market] = debug_info['markets_parsed'].get(market, 0) + 1

        # Calculate BBM projection
        bbm_row = bbm_lookup[matched_name]
        bbm_projection = calculate_bbm_projection(bbm_row, bbm_columns)

        if bbm_projection is None:
            debug_info['projection_failed'] += 1
            continue

        # Calculate edge
        try:
            line_float = float(line)
            edge = bbm_projection - line_float
            edge_pct = (edge / line_float * 100) if line_float != 0 else 0
            direction = "Over" if edge > 0 else "Under"

            edges.append({
                'site': site_name,
                'player': player_name,
                'matched_name': matched_name,
                'market': market,
                'line': line_float,
                'bbm_projection': bbm_projection,
                'edge': edge,
                'edge_pct': edge_pct,
                'abs_edge': abs(edge),
                'abs_edge_pct': abs(edge_pct),
                'direction': direction
            })

            # Track edges by market
            debug_info['edges_by_market'][market] = debug_info['edges_by_market'].get(market, 0) + 1

        except (ValueError, TypeError):
            continue

    debug_info['total_edges'] = len(edges)

    if debug:
        print(f"\n=== {site_name.upper()} MARKET DEBUG ===")
        print(f"Total rows: {debug_info['total_rows']}")
        print(f"Markets in file: {debug_info['markets_in_file']}")
        print(f"Markets parsed OK: {debug_info['markets_parsed']}")
        print(f"Markets FAILED: {debug_info['markets_failed']}")
        print(f"Player match failed: {debug_info['player_match_failed']}")
        print(f"Projection failed: {debug_info['projection_failed']}")
        print(f"Edges by market: {debug_info['edges_by_market']}")
        print(f"Total edges: {debug_info['total_edges']}")
        print(f"BBM columns available: {sorted(available_bbm_cols)}")

    return edges, debug_info


def rank_and_select_top_picks(edges: List[Dict]) -> Dict:
    """
    Rank edges and return multiple ranking lists.
    Returns dict with: top_by_pct, top_by_abs, best_by_market, best_under
    """
    if not edges:
        return {
            'top_by_pct': [],
            'top_by_abs': [],
            'best_by_market': {},
            'best_under': None
        }

    # Sort by absolute edge percentage descending
    sorted_by_pct = sorted(edges, key=lambda x: x['abs_edge_pct'], reverse=True)

    # Sort by absolute edge (raw points) descending
    sorted_by_abs = sorted(edges, key=lambda x: x['abs_edge'], reverse=True)

    def get_top_unique(sorted_list, count=10):
        """Get top N picks with player uniqueness."""
        seen_players = set()
        top_picks = []
        for edge in sorted_list:
            player = edge['player'].lower()
            if player not in seen_players:
                top_picks.append(edge)
                seen_players.add(player)
                if len(top_picks) == count:
                    break
        return top_picks

    # Top 10 by percentage
    top_by_pct = get_top_unique(sorted_by_pct, 10)

    # Top 10 by absolute edge
    top_by_abs = get_top_unique(sorted_by_abs, 10)

    # Best pick per market type
    best_by_market = {}
    for edge in sorted_by_pct:
        market = edge['market']
        if market not in best_by_market:
            best_by_market[market] = edge

    # Find best under (highest absolute edge where direction='Under')
    unders = [e for e in sorted_by_pct if e['direction'] == 'Under']
    best_under = unders[0] if unders else None

    return {
        'top_by_pct': top_by_pct,
        'top_by_abs': top_by_abs,
        'best_by_market': best_by_market,
        'best_under': best_under
    }


def format_output_for_site(site_name: str, rankings: Dict) -> str:
    """Format output for a single site with multiple ranking lists."""
    output = []

    top_by_pct = rankings.get('top_by_pct', [])
    top_by_abs = rankings.get('top_by_abs', [])
    best_by_market = rankings.get('best_by_market', {})
    best_under = rankings.get('best_under')

    def format_pick_line(i, pick):
        edge_pct = pick.get('edge_pct', 0)
        return (f"{i:<3} {pick['player'][:20]:<20} {pick['market'][:16]:<16} "
               f"{pick['direction']:<6} {pick['line']:<6.1f} "
               f"{pick['bbm_projection']:<6.1f} "
               f"{pick['edge']:+6.1f} {edge_pct:+6.1f}%")

    # === TOP 10 BY EDGE % ===
    output.append("=" * 100)
    output.append(f"🎯 {site_name.upper()} - TOP 10 BY EDGE %")
    output.append("=" * 100)

    if not top_by_pct:
        output.append("No picks found.")
    else:
        output.append(f"{'#':<3} {'Player':<20} {'Market':<16} {'Pick':<6} {'Line':<6} {'BBM':<6} {'Edge':<7} {'Edge%':<7}")
        output.append("-" * 100)
        for i, pick in enumerate(top_by_pct, 1):
            output.append(format_pick_line(i, pick))

    output.append("")

    # === TOP 10 BY ABSOLUTE EDGE ===
    output.append("=" * 100)
    output.append(f"🎯 {site_name.upper()} - TOP 10 BY ABSOLUTE EDGE")
    output.append("=" * 100)

    if not top_by_abs:
        output.append("No picks found.")
    else:
        output.append(f"{'#':<3} {'Player':<20} {'Market':<16} {'Pick':<6} {'Line':<6} {'BBM':<6} {'Edge':<7} {'Edge%':<7}")
        output.append("-" * 100)
        for i, pick in enumerate(top_by_abs, 1):
            output.append(format_pick_line(i, pick))

    output.append("")

    # === BEST BY MARKET ===
    output.append("=" * 100)
    output.append(f"🎯 {site_name.upper()} - BEST BY MARKET")
    output.append("=" * 100)

    if not best_by_market:
        output.append("No picks found.")
    else:
        for market, pick in best_by_market.items():
            edge_pct = pick.get('edge_pct', 0)
            output.append(f"{market:<18} {pick['player'][:18]:<18} {pick['direction']:<6} "
                         f"Line: {pick['line']:<6.1f} Edge: {pick['edge']:+5.1f} ({edge_pct:+5.1f}%)")

    output.append("")

    # === BEST UNDER ===
    if best_under:
        under_pct = best_under.get('edge_pct', 0)
        output.append(f"🎯 BEST UNDER: {best_under['player']} "
                     f"({best_under['market']}, Edge: {best_under['edge']:.1f}, {under_pct:.1f}%)")
    else:
        output.append("🎯 BEST UNDER: None found")

    output.append("")
    output.append("")

    return "\n".join(output)


def format_ladder_output(edges: List[Dict]) -> str:
    """
    Format Underdog Ladders output.
    Points only, Overs only, Top 20 by raw edge.
    """
    output = []

    # Filter for Points market and Overs only
    points_overs = [
        e for e in edges
        if e['market'].upper() in ['POINTS', 'PTS'] and e['direction'] == 'Over'
    ]

    if not points_overs:
        output.append("=" * 80)
        output.append("🏀 UNDERDOG LADDERS - TOP 20 POINT OVERS")
        output.append("=" * 80)
        output.append("No Points overs found.")
        output.append("")
        return "\n".join(output)

    # Sort by raw edge (points over) descending
    sorted_ladder = sorted(points_overs, key=lambda x: x['edge'], reverse=True)

    # Get top 20 unique players
    seen_players = set()
    top_ladder = []
    for edge in sorted_ladder:
        player = edge['player'].lower()
        if player not in seen_players:
            top_ladder.append(edge)
            seen_players.add(player)
            if len(top_ladder) == 20:
                break

    output.append("=" * 80)
    output.append("🏀 UNDERDOG LADDERS - TOP 20 POINT OVERS")
    output.append("=" * 80)
    output.append(f"{'#':<3} {'Player':<25} {'Line':<8} {'BBM':<8} {'Pts Over':<10}")
    output.append("-" * 80)

    for i, pick in enumerate(top_ladder, 1):
        output.append(f"{i:<3} {pick['player'][:23]:<25} {pick['line']:<8.1f} "
                     f"{pick['bbm_projection']:<8.1f} {pick['edge']:+8.1f}")

    output.append("")
    output.append("")

    return "\n".join(output)


def generate_csv_output(all_picks: Dict[str, Dict]) -> str:
    """Generate CSV output with all picks."""
    rows = []

    for site_name, rankings in all_picks.items():
        # Use top_by_pct as the main list for CSV
        top_picks = rankings.get('top_by_pct', [])
        for i, pick in enumerate(top_picks, 1):
            rows.append({
                'Rank': i,
                'Site': site_name,
                'Player': pick['player'],
                'Market': pick['market'],
                'Direction': pick['direction'],
                'Line': pick['line'],
                'BBM_Projection': round(pick['bbm_projection'], 2),
                'Edge': round(pick['edge'], 2),
                'Edge_Pct': round(pick.get('edge_pct', 0), 1)
            })

    df = pd.DataFrame(rows)
    return df.to_csv(index=False)


@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')


@app.route('/calculate', methods=['POST'])
def calculate():
    """Process uploaded files and calculate edges."""
    try:
        # BBM is required, site files are optional
        site_keys = ['prizepicks', 'underdog', 'pick6', 'sleeper', 'fanduel']
        uploaded_files = {}

        # Check for BBM file (required)
        if 'bbm' not in request.files or request.files['bbm'].filename == '':
            return jsonify({'error': 'Missing required file: BBM'}), 400
        uploaded_files['bbm'] = request.files['bbm']

        # Collect optional site files
        for site_key in site_keys:
            if site_key in request.files and request.files[site_key].filename != '':
                uploaded_files[site_key] = request.files[site_key]

        # Check at least one site file was uploaded
        site_files = [k for k in uploaded_files.keys() if k != 'bbm']
        if not site_files:
            return jsonify({'error': 'Please upload at least one site file (PrizePicks, Underdog, Pick6, Sleeper, or FanDuel)'}), 400

        # Extract and validate dates
        dates = {}
        for key, file in uploaded_files.items():
            if key != 'bbm':
                date = extract_date_from_filename(file.filename)
                if date:
                    dates[key] = date

        # Check for date consistency (only warn, don't block)
        unique_dates = set(dates.values())
        date_str = list(unique_dates)[0] if unique_dates else datetime.now().strftime('%Y-%m-%d')

        # Read BBM file
        bbm_file = uploaded_files['bbm']
        bbm_df = read_file(bbm_file)

        # Normalize BBM column names (handle different formats)
        bbm_df = normalize_bbm_columns(bbm_df)

        # Validate BBM columns after normalization - only Name is truly required
        if 'Name' not in bbm_df.columns:
            available = list(bbm_df.columns)
            return jsonify({
                'error': f'BBM file missing Name column. Available columns: {available}'
            }), 400

        # Check which stat columns are available
        stat_cols = ['p', 'r', 'a', 's', 'b', 'to', '3']
        available_stats = [col for col in stat_cols if col in bbm_df.columns]
        if not available_stats:
            available = list(bbm_df.columns)
            return jsonify({
                'error': f'BBM file has no stat columns (need at least one of: p, r, a, s, b, to, 3). Available columns: {available}'
            }), 400

        # Check for debug mode
        debug_mode = request.form.get('debug', 'false').lower() == 'true'

        # Process each site (only those that were uploaded)
        all_picks = {}
        all_output = []
        all_debug_info = {}

        for site_key in site_keys:
            # Skip sites that weren't uploaded
            if site_key not in uploaded_files:
                continue

            site_file = uploaded_files[site_key]
            site_name = SITE_NAMES.get(site_key, site_key.title())

            # Read and filter site data
            site_df = read_file(site_file)
            site_df = filter_nba_data(site_df)
            site_df = normalize_site_columns(site_df)

            # Validate site columns
            required_site_cols = ['Player', 'Market', 'Line']
            missing_cols = [col for col in required_site_cols if col not in site_df.columns]
            if missing_cols:
                # Skip this site with a warning instead of failing
                all_output.append(f"⚠️ {site_name}: Skipped - missing columns {missing_cols}")
                continue

            # Calculate edges (with debug info)
            edges, debug_info = calculate_edges_for_site(site_df, bbm_df, site_name, debug=debug_mode)
            all_debug_info[site_name] = debug_info

            # Rank and select top picks (returns dict with multiple rankings)
            rankings = rank_and_select_top_picks(edges)

            # Store results
            all_picks[site_name] = rankings

            # Format output
            output = format_output_for_site(site_name, rankings)
            all_output.append(output)

            # Add Underdog Ladders output if this is Underdog
            if site_key == 'underdog':
                ladder_output = format_ladder_output(edges)
                all_output.append(ladder_output)

        # Generate CSV
        csv_output = generate_csv_output(all_picks)

        # Combine all output
        full_output = "\n".join(all_output)

        response = {
            'success': True,
            'output': full_output,
            'csv': csv_output,
            'date': date_str
        }

        # Include debug info if requested
        if debug_mode:
            response['debug'] = all_debug_info
            response['bbm_columns'] = list(bbm_df.columns)

        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/download-csv', methods=['POST'])
def download_csv():
    """Download CSV file."""
    try:
        data = request.get_json()
        csv_content = data.get('csv', '')
        date_str = data.get('date', datetime.now().strftime('%Y-%m-%d'))

        # Create BytesIO object
        output = io.BytesIO()
        output.write(csv_content.encode('utf-8'))
        output.seek(0)

        filename = f'top_picks_{date_str}.csv'

        return send_file(
            output,
            mimetype='text/csv',
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(debug=debug, host='0.0.0.0', port=port)
