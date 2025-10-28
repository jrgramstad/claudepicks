#!/usr/bin/env python
"""
Test script to verify the core logic of the edge calculator.
"""

import pandas as pd
from app import (
    parse_market_to_bbm_columns,
    calculate_bbm_projection,
    fuzzy_match_player,
    filter_nba_data,
    calculate_edges_for_site,
    rank_and_select_top_picks
)

def test_market_parsing():
    """Test market parsing logic."""
    print("Testing market parsing...")

    tests = [
        ("Points", ['p']),
        ("PTS", ['p']),
        ("Rebounds", ['r']),
        ("PTS+REB+AST", ['p', 'r', 'a']),
        ("PTS+AST", ['p', 'a']),
        ("Assists", ['a']),
    ]

    for market, expected in tests:
        result = parse_market_to_bbm_columns(market)
        status = "✓" if result == expected else "✗"
        print(f"  {status} '{market}' -> {result} (expected {expected})")

    print()

def test_bbm_projection():
    """Test BBM projection calculation."""
    print("Testing BBM projection calculation...")

    # Create sample BBM row
    bbm_row = pd.Series({
        'Name': 'LeBron James',
        'p': 25.3,
        'r': 7.8,
        'a': 8.2,
        's': 1.2,
        'b': 0.8,
        'to': 3.5
    })

    tests = [
        (['p'], 25.3),
        (['r'], 7.8),
        (['p', 'r', 'a'], 41.3),
        (['p', 'a'], 33.5),
    ]

    for columns, expected in tests:
        result = calculate_bbm_projection(bbm_row, columns)
        status = "✓" if abs(result - expected) < 0.01 else "✗"
        print(f"  {status} {columns} -> {result:.1f} (expected {expected})")

    print()

def test_fuzzy_matching():
    """Test fuzzy player name matching."""
    print("Testing fuzzy name matching...")

    bbm_names = [
        "LeBron James",
        "Stephen Curry",
        "Nikola Jokic",
        "Kevin Durant"
    ]

    tests = [
        ("LeBron James", "LeBron James"),
        ("lebron james", "LeBron James"),
        ("Steph Curry", "Stephen Curry"),
        ("Nikola Jokić", "Nikola Jokic"),
        ("KD", None),  # Too short, won't match
    ]

    for input_name, expected in tests:
        result = fuzzy_match_player(input_name, bbm_names)
        status = "✓" if result == expected else "✗"
        print(f"  {status} '{input_name}' -> {result} (expected {expected})")

    print()

def test_full_pipeline():
    """Test the full edge calculation pipeline."""
    print("Testing full edge calculation pipeline...")

    # Create sample BBM data
    bbm_df = pd.DataFrame({
        'Name': ['LeBron James', 'Stephen Curry'],
        'p': [25.3, 29.8],
        'r': [7.8, 5.1],
        'a': [8.2, 6.4],
        's': [1.2, 1.5],
        'b': [0.8, 0.3],
        'to': [3.5, 2.9]
    })

    # Create sample site data
    site_df = pd.DataFrame({
        'Player': ['LeBron James', 'Stephen Curry'],
        'Market': ['PTS+REB+AST', 'Points'],
        'Line': [40.5, 27.5],
        'Sport': ['NBA', 'NBA']
    })

    # Calculate edges
    edges = calculate_edges_for_site(site_df, bbm_df, 'Test')

    print(f"  ✓ Calculated {len(edges)} edges")

    if edges:
        for edge in edges:
            print(f"    - {edge['player']}: {edge['market']} "
                  f"Line: {edge['line']:.1f}, BBM: {edge['bbm_projection']:.2f}, "
                  f"Edge: {edge['edge']:+.2f} ({edge['direction']})")

    # Rank and select
    top_picks, best_under = rank_and_select_top_picks(edges)
    print(f"  ✓ Selected {len(top_picks)} top picks")
    print(f"  ✓ Best under: {best_under['player'] if best_under else 'None'}")

    print()

def test_nba_filtering():
    """Test NBA data filtering."""
    print("Testing NBA filtering...")

    # With Sport column
    df_with_sport = pd.DataFrame({
        'Player': ['Player 1', 'Player 2', 'Player 3'],
        'Sport': ['NBA', 'MLB', 'NBA']
    })

    filtered = filter_nba_data(df_with_sport)
    status = "✓" if len(filtered) == 2 else "✗"
    print(f"  {status} Filtered from 3 to {len(filtered)} NBA rows (expected 2)")

    # Without Sport column
    df_without_sport = pd.DataFrame({
        'Player': ['Player 1', 'Player 2']
    })

    filtered = filter_nba_data(df_without_sport)
    status = "✓" if len(filtered) == 2 else "✗"
    print(f"  {status} No Sport column: kept all {len(filtered)} rows (expected 2)")

    print()

if __name__ == '__main__':
    print("=" * 60)
    print("NBA Pick'em Edge Calculator - Logic Tests")
    print("=" * 60)
    print()

    test_market_parsing()
    test_bbm_projection()
    test_fuzzy_matching()
    test_nba_filtering()
    test_full_pipeline()

    print("=" * 60)
    print("All tests completed!")
    print("=" * 60)
