# Finance Copilot - Python Agent System

## 🎯 Overview

A modular, production-grade Python agent system that generates personalized financial strategies for startup founders using Google's Gemini AI.

## 📁 Architecture

```
.
├── agents/                      # Individual AI agents
│   ├── base_agent.py           # Abstract base class
│   ├── funding_stage_agent.py  # Determines funding stage
│   ├── raise_amount_agent.py   # Calculates raise amount
│   ├── investor_type_agent.py  # Identifies ideal investors
│   ├── runway_agent.py         # Estimates runway & burn rate
│   └── financial_priority_agent.py  # Defines financial priorities
│
├── orchestrator/               # Agent chain management
│   └── chain_manager.py       # Executes agents sequentially
│
├── utils/                     # Utilities
│   ├── prompt_templates.py   # Structured prompts for each agent
│   └── data_validation.py    # Input validation with Pydantic
│
├── main.py                    # CLI entry point
├── requirements.txt           # Python dependencies
└── .env.example              # Environment template
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 3. Run the Agent Chain

```bash
python main.py
```

## 🧩 Agent Descriptions

### 1. **FundingStageAgent**
- **Purpose:** Determines the appropriate funding stage
- **Stages:** Idea, Pre-Seed, Seed, Series A, Series B+, Bootstrapped
- **Inputs:** Product stage, revenue, traction, team size
- **Output:** Funding stage + confidence + rationale

### 2. **RaiseAmountAgent**
- **Purpose:** Recommends how much capital to raise
- **Inputs:** Funding stage, team size, goals, burn rate
- **Output:** Recommended amount + breakdown by category

### 3. **InvestorTypeAgent**
- **Purpose:** Identifies ideal investor profiles
- **Inputs:** Funding stage, raise amount, industry, geography
- **Output:** Primary investor type + alternatives + approach strategy

### 4. **RunwayAgent**
- **Purpose:** Calculates expected runway and burn rate
- **Inputs:** Raise amount, team size, revenue, costs
- **Output:** Runway estimate + burn rate + milestones

### 5. **FinancialPriorityAgent**
- **Purpose:** Defines top 3-5 financial priorities
- **Inputs:** All previous agent outputs + startup profile
- **Output:** Prioritized action items + quick wins + metrics

## 🔗 Integration with Next.js Frontend

### Option 1: FastAPI Wrapper (Recommended)

Create a FastAPI service to expose the agent chain:

```python
# api_server.py
from fastapi import FastAPI, HTTPException
from orchestrator import ChainManager
import os

app = FastAPI()
chain_manager = ChainManager(api_key=os.getenv("GEMINI_API_KEY"))

@app.post("/api/finance-strategy")
async def generate_strategy(input_data: dict):
    try:
        result = chain_manager.run(input_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

Run with:
```bash
uvicorn api_server:app --host 0.0.0.0 --port 8000
```

### Option 2: Direct Integration (Next.js API Route)

Call the Python script from a Next.js API route using child_process:

```typescript
// src/app/api/finance-strategy/route.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  const input = await req.json();
  
  const { stdout } = await execAsync(
    `python3 main.py '${JSON.stringify(input)}'`
  );
  
  return Response.json(JSON.parse(stdout));
}
```

## 🧪 Testing

### Test Individual Agent

```python
from agents import FundingStageAgent
import os

agent = FundingStageAgent(api_key=os.getenv("GEMINI_API_KEY"))

test_input = {
    "startupName": "TestCo",
    "productStage": "MVP",
    "monthlyRevenue": 5000,
    # ... other fields
}

result = agent.run(test_input, {})
print(result)
```

### Test Full Chain

```python
from orchestrator import ChainManager

chain = ChainManager()
result = chain.run({
    # ... full startup input
})
print(result)
```

## 📊 Output Format

```json
{
  "startup_name": "TechFlow AI",
  "funding_stage": {
    "funding_stage": "Seed",
    "confidence": "high",
    "rationale": "...",
    "stage_characteristics": "..."
  },
  "raise_amount": {
    "recommended_amount": "$500K-$750K",
    "minimum_viable": "$400K",
    "optimal_amount": "$750K",
    "rationale": "...",
    "breakdown": { ... }
  },
  "investor_type": {
    "primary_investor_type": "Seed VCs",
    "secondary_options": [...],
    "rationale": "..."
  },
  "runway": {
    "estimated_runway_months": "18-24",
    "monthly_burn_rate": "$35K-$40K",
    "assumptions": { ... }
  },
  "financial_priority": {
    "priorities": [
      {
        "priority": "Hire 2 engineers",
        "importance": "critical",
        "rationale": "...",
        "timeline": "Next 3 months"
      }
    ],
    "quick_wins": [...],
    "success_metrics": [...]
  },
  "summary": "Based on the analysis...",
  "metadata": {
    "execution_time_seconds": 12.5,
    "timestamp": "2025-10-12T...",
    "agents_executed": 5
  }
}
```

## 🛠️ Customization

### Add a New Agent

1. Create `agents/new_agent.py`:
```python
from .base_agent import BaseAgent

class NewAgent(BaseAgent):
    def get_description(self) -> str:
        return "Description"
    
    def run(self, input_data, context):
        # Your logic
        return {"result": "..."}
```

2. Add prompt to `utils/prompt_templates.py`
3. Register in `agents/__init__.py`
4. Add to chain in `orchestrator/chain_manager.py`

### Modify Prompts

Edit `utils/prompt_templates.py` to adjust agent behavior.

### Change LLM Model

In each agent, change:
```python
self.model = genai.GenerativeModel('gemini-1.5-pro')
# To:
self.model = genai.GenerativeModel('gemini-1.5-flash')  # Faster, cheaper
```

## 🐛 Debugging

Enable detailed logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

Access execution logs:
```python
chain_manager = ChainManager()
result = chain_manager.run(input_data)
logs = chain_manager.get_execution_log()
print(logs)
```

## 📈 Performance

- **Average execution time:** 10-15 seconds (5 agents × 2-3s each)
- **Cost:** ~$0.001 per analysis (Gemini 1.5 Pro)
- **Optimization:** Use `gemini-1.5-flash` for 3x speed improvement

## 🔐 Security

- Never commit `.env` file
- Use environment variables for API keys
- Validate all inputs with Pydantic
- Implement rate limiting in production

## 📝 License

MIT

