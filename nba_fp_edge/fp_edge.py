#!/usr/bin/env python3
"""
NBA Fantasy Points Edge Calculator
Compares BBM projections vs Underdog/PrizePicks fantasy point lines
"""

import argparse
import pandas as pd
from datetime import datetime
from pathlib import Path
from rapidfuzz import fuzz, process
import sys

# Fantasy Points Scoring (Underdog/PrizePicks use same weights)
SCORING = {
    'underdog': {'pts': 1.0, 'reb': 1.2, 'ast': 1.5, 'stl': 3.0, 'blk': 3.0, 'tov': -1.0},
    'prizepicks': {'pts': 1.0, 'reb': 1.2, 'ast': 1.5, 'stl': 3.0, 'blk': 3.0, 'tov': -1.0},
}

def parse_bbm_file(file_path):
    """
    Parse Basketball Monster Excel export
    Returns DataFrame with player projections
    """
    print(f"📂 Loading BBM file: {file_path}")

    # Try reading Excel file
    try:
        df = pd.read_excel(file_path, engine='xlrd')
    except Exception as e:
        print(f"❌ Error reading Excel file: {e}")
        print("ℹ️  Trying openpyxl engine...")
        try:
            df = pd.read_excel(file_path, engine='openpyxl')
        except Exception as e2:
            print(f"❌ Failed with openpyxl: {e2}")
            sys.exit(1)

    print(f"✅ Loaded {len(df)} players from BBM")
    print(f"📊 Columns: {', '.join(df.columns.tolist())}")

    # Check for required columns
    required = ['Name']
    stat_columns = ['p', 'r', 'a', 's', 'b', 'to']

    missing = [col for col in required if col not in df.columns]
    if missing:
        print(f"❌ Missing required columns: {missing}")
        sys.exit(1)

    missing_stats = [col for col in stat_columns if col not in df.columns]
    if missing_stats:
        print(f"⚠️  Missing stat columns: {missing_stats}")
        print("    Will attempt to calculate fantasy points with available stats")

    return df

def calculate_fantasy_points(row, scoring='underdog'):
    """
    Calculate fantasy points for a player
    Formula: (pts × 1.0) + (reb × 1.2) + (ast × 1.5) + (stl × 3.0) + (blk × 3.0) + (tov × -1.0)
    """
    weights = SCORING[scoring]

    fp = 0.0

    # Points
    if 'p' in row and pd.notna(row['p']):
        fp += float(row['p']) * weights['pts']

    # Rebounds
    if 'r' in row and pd.notna(row['r']):
        fp += float(row['r']) * weights['reb']

    # Assists
    if 'a' in row and pd.notna(row['a']):
        fp += float(row['a']) * weights['ast']

    # Steals
    if 's' in row and pd.notna(row['s']):
        fp += float(row['s']) * weights['stl']

    # Blocks
    if 'b' in row and pd.notna(row['b']):
        fp += float(row['b']) * weights['blk']

    # Turnovers (negative)
    if 'to' in row and pd.notna(row['to']):
        fp += float(row['to']) * weights['tov']

    return round(fp, 2)

def parse_lines_file(file_path):
    """
    Parse platform lines CSV
    Supports RotoWire format or simple Player,Line format
    """
    print(f"📂 Loading lines file: {file_path}")

    df = pd.read_csv(file_path)

    print(f"✅ Loaded {len(df)} lines")
    print(f"📊 Columns: {', '.join(df.columns.tolist())}")

    # Detect format
    if 'Market Name' in df.columns:
        # RotoWire format
        print("ℹ️  Detected RotoWire format")

        # Filter to Fantasy Points market
        df = df[df['Market Name'].str.contains('Fantasy', case=False, na=False)]
        print(f"   Filtered to {len(df)} Fantasy Points lines")

        # Rename columns
        if 'Player' not in df.columns and 'NAME' in df.columns:
            df = df.rename(columns={'NAME': 'Player'})

    # Ensure we have Player and Line columns
    if 'Player' not in df.columns:
        print("❌ Missing 'Player' column")
        sys.exit(1)

    if 'Line' not in df.columns:
        print("❌ Missing 'Line' column")
        sys.exit(1)

    return df[['Player', 'Line']].copy()

def normalize_name(name):
    """
    Normalize player name for matching
    """
    if pd.isna(name):
        return ""

    name = str(name).strip()

    # Remove suffixes
    for suffix in [' Jr.', ' Sr.', ' III', ' II', ' IV']:
        name = name.replace(suffix, '')

    # Remove periods
    name = name.replace('.', '')

    # Lowercase for comparison
    return name.lower()

def match_players(bbm_df, lines_df, threshold=85):
    """
    Match players between BBM and lines using fuzzy matching
    Returns DataFrame with matched players
    """
    print(f"\n🔗 Matching players (threshold: {threshold}%)...")

    # Create normalized names
    bbm_names = bbm_df['Name'].tolist()
    lines_names = lines_df['Player'].tolist()

    bbm_normalized = {name: normalize_name(name) for name in bbm_names}
    lines_normalized = {name: normalize_name(name) for name in lines_names}

    matched = []
    unmatched_lines = []

    for line_player in lines_names:
        line_norm = normalize_name(line_player)

        # Try exact match first
        exact_matches = [bbm_player for bbm_player, bbm_norm in bbm_normalized.items()
                        if bbm_norm == line_norm]

        if exact_matches:
            matched.append({
                'bbm_player': exact_matches[0],
                'line_player': line_player,
                'match_score': 100
            })
            continue

        # Fuzzy match
        result = process.extractOne(
            line_norm,
            bbm_normalized.values(),
            scorer=fuzz.ratio,
            score_cutoff=threshold
        )

        if result:
            matched_norm, score, _ = result
            # Find original BBM name
            bbm_player = [name for name, norm in bbm_normalized.items() if norm == matched_norm][0]

            matched.append({
                'bbm_player': bbm_player,
                'line_player': line_player,
                'match_score': score
            })
        else:
            unmatched_lines.append(line_player)

    print(f"✅ Matched {len(matched)} players")

    if unmatched_lines:
        print(f"⚠️  {len(unmatched_lines)} unmatched players from lines:")
        for player in unmatched_lines[:10]:
            print(f"   - {player}")
        if len(unmatched_lines) > 10:
            print(f"   ... and {len(unmatched_lines) - 10} more")

    return pd.DataFrame(matched), unmatched_lines

def calculate_edges(bbm_df, lines_df, scoring='underdog'):
    """
    Calculate fantasy point edges for all matched players
    """
    print(f"\n🧮 Calculating fantasy point edges...")

    # Match players
    matches_df, unmatched = match_players(bbm_df, lines_df)

    if matches_df.empty:
        print("❌ No players matched!")
        sys.exit(1)

    results = []

    for _, match in matches_df.iterrows():
        bbm_player = match['bbm_player']
        line_player = match['line_player']

        # Get BBM row
        bbm_row = bbm_df[bbm_df['Name'] == bbm_player].iloc[0]

        # Get line
        line_row = lines_df[lines_df['Player'] == line_player].iloc[0]
        line = float(line_row['Line'])

        # Calculate BBM fantasy points
        bbm_fp = calculate_fantasy_points(bbm_row, scoring)

        # Calculate edge
        edge = bbm_fp - line
        edge_pct = (edge / line) * 100 if line > 0 else 0

        # Get optional fields
        inj = bbm_row.get('Inj', '') if 'Inj' in bbm_row else ''
        ease = bbm_row.get('Ease', '') if 'Ease' in bbm_row else ''
        team = bbm_row.get('Team', '') if 'Team' in bbm_row else ''

        results.append({
            'Player': line_player,
            'Team': team,
            'Line': line,
            'BBM_FP': bbm_fp,
            'Edge': edge,
            'Edge_Pct': edge_pct,
            'Ease': ease,
            'Inj': inj,
            'Match_Score': match['match_score']
        })

    results_df = pd.DataFrame(results)

    print(f"✅ Calculated edges for {len(results_df)} players")

    return results_df

def print_results(results_df, min_edge=None):
    """
    Print formatted results to console
    """
    if min_edge:
        results_df = results_df[abs(results_df['Edge']) >= min_edge]

    # Separate into categories
    overs = results_df[results_df['Edge'] > 0].sort_values('Edge', ascending=False)
    unders = results_df[results_df['Edge'] < 0].sort_values('Edge')
    skip = results_df[results_df['Inj'].isin(['O', 'D'])].sort_values('Edge', ascending=False)

    date_str = datetime.now().strftime('%Y-%m-%d')

    print("\n" + "=" * 100)
    print(f"NBA FANTASY POINTS EDGE CALCULATOR — {date_str}")
    print(f"Platform: Underdog Fantasy")
    print("=" * 100)

    # Print Overs
    print(f"\n🟢 OVERS (BBM projects ABOVE line): {len(overs)} plays")
    print("-" * 100)

    if not overs.empty:
        print(f"{'#':<3} {'Player':<25} {'Team':<5} {'Line':<7} {'BBM Proj':<10} {'Edge':<8} {'Edge%':<8} {'Ease':<6} {'Inj':<4}")
        print("-" * 100)

        for idx, row in overs.head(25).iterrows():
            print(f"{idx+1:<3} {row['Player']:<25} {row['Team']:<5} "
                  f"{row['Line']:<7.1f} {row['BBM_FP']:<10.2f} "
                  f"{row['Edge']:+7.2f} {row['Edge_Pct']:+7.1f}% "
                  f"{str(row['Ease']):<6} {row['Inj']:<4}")

    # Print Unders
    print(f"\n🔴 UNDERS (BBM projects BELOW line): {len(unders)} plays")
    print("-" * 100)

    if not unders.empty:
        print(f"{'#':<3} {'Player':<25} {'Team':<5} {'Line':<7} {'BBM Proj':<10} {'Edge':<8} {'Edge%':<8} {'Ease':<6} {'Inj':<4}")
        print("-" * 100)

        for idx, row in unders.head(25).iterrows():
            print(f"{idx+1:<3} {row['Player']:<25} {row['Team']:<5} "
                  f"{row['Line']:<7.1f} {row['BBM_FP']:<10.2f} "
                  f"{row['Edge']:+7.2f} {row['Edge_Pct']:+7.1f}% "
                  f"{str(row['Ease']):<6} {row['Inj']:<4}")

    # Print injured players to skip
    if not skip.empty:
        print(f"\n⚠️  SKIP (injured/DNP): {len(skip)} players")
        print("-" * 100)
        for _, row in skip.iterrows():
            print(f"   - {row['Player']} ({row['Inj']}) — {row['Team']}")

    print("\n" + "=" * 100)

def export_csv(results_df, output_dir='./exports'):
    """
    Export results to CSV
    """
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)

    date_str = datetime.now().strftime('%Y-%m-%d')
    filename = output_path / f"fp_edges_{date_str}.csv"

    results_df.to_csv(filename, index=False)
    print(f"\n💾 Exported to: {filename}")

def main():
    parser = argparse.ArgumentParser(description='NBA Fantasy Points Edge Calculator')
    parser.add_argument('--bbm', required=True, help='Path to BBM Excel file')
    parser.add_argument('--lines', required=True, help='Path to lines CSV file')
    parser.add_argument('--scoring', default='underdog', choices=['underdog', 'prizepicks'],
                       help='Platform scoring system (default: underdog)')
    parser.add_argument('--min-edge', type=float, help='Minimum edge to display')
    parser.add_argument('--export', action='store_true', help='Export results to CSV')
    parser.add_argument('--threshold', type=int, default=85,
                       help='Fuzzy matching threshold (default: 85)')

    args = parser.parse_args()

    # Parse input files
    bbm_df = parse_bbm_file(args.bbm)
    lines_df = parse_lines_file(args.lines)

    # Calculate edges
    results_df = calculate_edges(bbm_df, lines_df, args.scoring)

    # Print results
    print_results(results_df, args.min_edge)

    # Export if requested
    if args.export:
        export_csv(results_df)

    print("\n✅ Done!")

if __name__ == '__main__':
    main()
