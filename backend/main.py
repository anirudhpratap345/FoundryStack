"""
FinIQ.ai - Main Entry Point
Demonstrates the agent chain execution.
"""

import os
import json
from dotenv import load_dotenv
from pathlib import Path

from orchestrator import ChainManager


def main():
    """
    Main execution function.
    Can be used for testing or as a standalone CLI tool.
    """
    # Load environment variables from .env.local (Next.js style) or .env
    env_local = Path('.env.local')
    env_file = Path('.env')
    
    if env_local.exists():
        load_dotenv(env_local)
    elif env_file.exists():
        load_dotenv(env_file)
    else:
        load_dotenv()  # Try default locations
    
    # Check for API key
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("[ERROR] GEMINI_API_KEY not found in environment")
        print("Please check your .env or .env.local file")
        print(f"Checked file: {env_local if env_local.exists() else env_file}")
        return
    
    print(f"[OK] Loaded API key from: {'.env.local' if env_local.exists() else '.env'}")
    
    # Example startup input (matches frontend form)
    example_input = {
        "startupName": "TechFlow AI",
        "industry": "Artificial Intelligence / SaaS",
        "targetMarket": "B2B",
        "geography": "United States",
        "teamSize": 3,
        "productStage": "MVP",
        "monthlyRevenue": 5000,
        "growthRate": "20% MoM",
        "tractionSummary": "50 beta users, 5 paying customers",
        "businessModel": "SaaS subscription ($99/month)",
        "fundingGoal": 500000,
        "mainFinancialConcern": "Need to hire engineers and scale sales"
    }
    
    print("\n" + "=" * 70)
    print("FinIQ.ai for Founders")
    print("=" * 70)
    print("\nInput:")
    print(json.dumps(example_input, indent=2))
    
    try:
        # Initialize chain manager
        chain_manager = ChainManager(api_key=api_key)
        
        # Run the analysis
        result = chain_manager.run(example_input)
        
        # Display results
        print("\n\n" + "=" * 70)
        print("FINANCIAL STRATEGY REPORT")
        print("=" * 70)
        
        print(f"\nStartup: {result['startup_name']}")
        print(f"Summary: {result['summary']}")
        
        print("\nFunding Stage:")
        print(json.dumps(result['funding_stage'], indent=2))
        
        print("\nRaise Amount:")
        print(json.dumps(result['raise_amount'], indent=2))
        
        print("\nInvestor Type:")
        print(json.dumps(result['investor_type'], indent=2))
        
        print("\nRunway Analysis:")
        print(json.dumps(result['runway'], indent=2))
        
        print("\nFinancial Priorities:")
        print(json.dumps(result['financial_priority'], indent=2))
        
        print("\n\n" + "=" * 70)
        print("[COMPLETE] Analysis Complete!")
        print(f"Execution Time: {result['metadata']['execution_time_seconds']:.2f}s")
        print("=" * 70)
        
        # Save to file
        output_file = "finance_strategy_output.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2)
        print(f"\n[SAVED] Full report saved to: {output_file}")
        
    except Exception as e:
        print(f"\n[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()

