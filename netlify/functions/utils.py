"""Shared utility functions for edge calculations."""
import pandas as pd
from rapidfuzz import fuzz, process
import re
from datetime import datetime
from typing import Dict, List, Tuple, Optional

# BBM column mapping
BBM_COLUMNS = {
    'PTS': 'p',
    'REB': 'r',
    'AST': 'a',
    'STL': 's',
    'BLK': 'b',
    'TO': 'to'
}

# Site names mapping
SITE_NAMES = {
    'prizepicks': 'PrizePicks',
    'underdog': 'Underdog',
    'pick6': 'Pick6',
    'sleeper': 'Sleeper',
    'fanduel': 'FanDuel'
}


def parse_market_to_bbm_columns(market: str) -> List[str]:
    """
    Parse market name to BBM column names.
    Examples: 'PTS+REB+AST' -> ['p', 'r', 'a']
              'Points' -> ['p']
              'Rebounds' -> ['r']
    """
    market_upper = market.upper().strip()

    # Direct mappings
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
        'TO': ['to']
    }

    # Check for direct match
    if market_upper in direct_mappings:
        return direct_mappings[market_upper]

    # Check for combo stats (e.g., PTS+REB+AST)
    columns = []
    for stat, col in BBM_COLUMNS.items():
        if stat in market_upper:
            columns.append(col)

    return columns if columns else []


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


def filter_nba_data(df: pd.DataFrame) -> pd.DataFrame:
    """Filter for NBA data if Sport column exists."""
    if 'Sport' in df.columns:
        return df[df['Sport'].str.upper() == 'NBA'].copy()
    return df.copy()


def calculate_edges_for_site(site_df: pd.DataFrame, bbm_df: pd.DataFrame, site_name: str) -> List[Dict]:
    """Calculate edges for a single site."""
    edges = []
    bbm_names = bbm_df['Name'].tolist()

    # Create BBM lookup dictionary
    bbm_lookup = {row['Name']: row for _, row in bbm_df.iterrows()}

    for _, row in site_df.iterrows():
        player_name = row.get('Player', '')
        market = row.get('Market', '')
        line = row.get('Line', None)

        if not player_name or not market or pd.isna(line):
            continue

        # Fuzzy match player name
        matched_name = fuzzy_match_player(player_name, bbm_names)
        if not matched_name:
            continue

        # Parse market to BBM columns
        bbm_columns = parse_market_to_bbm_columns(market)
        if not bbm_columns:
            continue

        # Calculate BBM projection
        bbm_row = bbm_lookup[matched_name]
        bbm_projection = calculate_bbm_projection(bbm_row, bbm_columns)

        if bbm_projection is None:
            continue

        # Calculate edge
        try:
            line_float = float(line)
            edge = bbm_projection - line_float
            direction = "Over" if edge > 0 else "Under"

            edges.append({
                'site': site_name,
                'player': player_name,
                'matched_name': matched_name,
                'market': market,
                'line': line_float,
                'bbm_projection': bbm_projection,
                'edge': edge,
                'abs_edge': abs(edge),
                'direction': direction
            })
        except (ValueError, TypeError):
            continue

    return edges


def rank_and_select_top_picks(edges: List[Dict]) -> Tuple[List[Dict], Optional[Dict]]:
    """
    Rank edges and select top 5 picks with player uniqueness.
    Also find best under.
    """
    if not edges:
        return [], None

    # Sort by absolute edge descending
    sorted_edges = sorted(edges, key=lambda x: x['abs_edge'], reverse=True)

    # Enforce player uniqueness
    seen_players = set()
    top_picks = []

    for edge in sorted_edges:
        player = edge['player'].lower()
        if player not in seen_players:
            top_picks.append(edge)
            seen_players.add(player)

            if len(top_picks) == 5:
                break

    # Find best under (highest absolute edge where direction='Under')
    unders = [e for e in sorted_edges if e['direction'] == 'Under']
    best_under = unders[0] if unders else None

    return top_picks, best_under


def format_output_for_site(site_name: str, top_picks: List[Dict], best_under: Optional[Dict]) -> str:
    """Format output for a single site in screenshot-ready format."""
    output = []
    output.append("=" * 100)
    output.append(f"🎯 {site_name.upper()} - TOP 5")
    output.append("=" * 100)

    if not top_picks:
        output.append("No picks found for this site.")
    else:
        for i, pick in enumerate(top_picks, 1):
            line = (f"{i}. {pick['player']:<25} {pick['market']:<20} "
                   f"{pick['direction']:<8} Line: {pick['line']:<8.1f} "
                   f"BBM: {pick['bbm_projection']:<8.2f} "
                   f"Edge: {pick['edge']:+.2f}")
            output.append(line)

    output.append("")

    if best_under:
        output.append(f"🎯 BEST UNDER: {best_under['player']} "
                     f"({best_under['market']}, Edge: {best_under['edge']:.2f})")
    else:
        output.append("🎯 BEST UNDER: None found")

    output.append("")

    return "\n".join(output)


def generate_csv_output(all_picks: Dict[str, List[Dict]]) -> str:
    """Generate CSV output with all picks."""
    rows = []

    for site_name, picks in all_picks.items():
        for i, pick in enumerate(picks['top_5'], 1):
            rows.append({
                'Rank': i,
                'Site': site_name,
                'Player': pick['player'],
                'Market': pick['market'],
                'Direction': pick['direction'],
                'Line': pick['line'],
                'BBM_Projection': pick['bbm_projection'],
                'Edge': pick['edge']
            })

    df = pd.DataFrame(rows)
    return df.to_csv(index=False)
