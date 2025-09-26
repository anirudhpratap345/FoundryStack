from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import json
import asyncio
from datetime import datetime

app = FastAPI(
    title="FoundryStack Reviewer Agent",
    description="Reviews and refines AI-generated blueprints for technical correctness and quality",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Specific origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Pydantic Models
class WriterOutput(BaseModel):
    founder_report: str
    one_pager: str
    pitch_ready: str
    tweet: str
    processing_time: Optional[float] = None
    timestamp: Optional[str] = None

class ReviewRequest(BaseModel):
    writer_output: WriterOutput
    original_query: Optional[str] = None
    user_context: Optional[Dict[str, Any]] = None

class Issue(BaseModel):
    type: str  # "technical", "security", "clarity", "feasibility", "completeness"
    severity: str  # "low", "medium", "high", "critical"
    description: str
    location: str  # "founder_report", "one_pager", "pitch_ready", "tweet", "general"
    suggestion: str

class ReviewResponse(BaseModel):
    reviewed_founder_report: str
    reviewed_one_pager: str
    reviewed_pitch_ready: str
    reviewed_tweet: str
    issues_found: List[Issue]
    suggestions: List[str]
    overall_score: float  # 0-100
    processing_time: float
    timestamp: str

class ReviewerAgent:
    def __init__(self):
        self.tech_stack_patterns = {
            "frontend": ["react", "next.js", "vue", "angular", "svelte"],
            "backend": ["node.js", "python", "java", "c#", "go", "rust"],
            "database": ["postgresql", "mysql", "mongodb", "redis", "supabase"],
            "cloud": ["aws", "azure", "gcp", "vercel", "netlify"],
            "auth": ["supabase", "auth0", "firebase", "cognito", "okta"]
        }
        
        self.security_keywords = [
            "authentication", "authorization", "encryption", "https", "ssl", "tls",
            "oauth", "jwt", "session", "csrf", "xss", "sql injection", "cors"
        ]
        
        self.compliance_keywords = {
            "fintech": ["pci", "sox", "gdpr", "ccpa", "kyc", "aml"],
            "healthcare": ["hipaa", "fda", "hitech", "ccpa"],
            "general": ["gdpr", "ccpa", "sox", "iso27001"]
        }
    
    def detect_industry(self, content: str) -> str:
        """Detect industry from content"""
        content_lower = content.lower()
        
        if any(keyword in content_lower for keyword in ['fintech', 'finance', 'banking', 'payment', 'crypto', 'trading']):
            return 'fintech'
        elif any(keyword in content_lower for keyword in ['healthcare', 'medical', 'health', 'patient', 'doctor', 'clinic']):
            return 'healthcare'
        else:
            return 'general'
    
    def analyze_technical_correctness(self, content: str, industry: str) -> List[Issue]:
        """Analyze technical correctness of the content"""
        issues = []
        content_lower = content.lower()
        
        # Check for generic tech recommendations
        if "modern web stack" in content_lower or "latest technology" in content_lower:
            issues.append(Issue(
                type="technical",
                severity="medium",
                description="Generic technology recommendations detected",
                location="general",
                suggestion="Specify exact technologies and versions (e.g., Next.js 14, Node.js 20, PostgreSQL 15)"
            ))
        
        # Check for missing authentication
        if not any(auth in content_lower for auth in self.tech_stack_patterns["auth"]):
            issues.append(Issue(
                type="security",
                severity="high",
                description="Authentication system not mentioned",
                location="general",
                suggestion="Add authentication solution (Supabase Auth, Auth0, or Firebase Auth)"
            ))
        
        # Check for missing database
        if not any(db in content_lower for db in self.tech_stack_patterns["database"]):
            issues.append(Issue(
                type="technical",
                severity="high",
                description="Database solution not specified",
                location="general",
                suggestion="Specify database choice (PostgreSQL, MongoDB, Supabase, etc.)"
            ))
        
        # Check for missing deployment strategy
        if "deploy" not in content_lower and "hosting" not in content_lower:
            issues.append(Issue(
                type="feasibility",
                severity="medium",
                description="Deployment strategy not mentioned",
                location="general",
                suggestion="Add deployment plan (Vercel, AWS, Docker, etc.)"
            ))
        
        return issues
    
    def analyze_security_compliance(self, content: str, industry: str) -> List[Issue]:
        """Analyze security and compliance aspects"""
        issues = []
        content_lower = content.lower()
        
        # Check for security keywords
        security_mentioned = any(keyword in content_lower for keyword in self.security_keywords)
        if not security_mentioned:
            issues.append(Issue(
                type="security",
                severity="high",
                description="Security considerations not mentioned",
                location="general",
                suggestion="Add security measures (HTTPS, data encryption, secure authentication)"
            ))
        
        # Check industry-specific compliance
        if industry in self.compliance_keywords:
            compliance_keywords = self.compliance_keywords[industry]
            compliance_mentioned = any(keyword in content_lower for keyword in compliance_keywords)
            if not compliance_mentioned:
                issues.append(Issue(
                    type="security",
                    severity="high",
                    description=f"{industry.title()} compliance requirements not addressed",
                    location="general",
                    suggestion=f"Add {industry} compliance considerations ({', '.join(compliance_keywords[:3])})"
                ))
        
        return issues
    
    def analyze_clarity_readability(self, content: str) -> List[Issue]:
        """Analyze clarity and readability"""
        issues = []
        
        # Check for overly technical jargon
        if len(content.split()) > 0:
            avg_word_length = sum(len(word) for word in content.split()) / len(content.split())
            if avg_word_length > 8:
                issues.append(Issue(
                    type="clarity",
                    severity="low",
                    description="Content may be too technical for general audience",
                    location="general",
                    suggestion="Simplify technical terms and add explanations"
                ))
        
        # Check for missing structure
        if "##" not in content and "**" not in content:
            issues.append(Issue(
                type="clarity",
                severity="medium",
                description="Content lacks proper structure and formatting",
                location="general",
                suggestion="Add headers, bullet points, and clear sections"
            ))
        
        return issues
    
    def analyze_feasibility(self, content: str) -> List[Issue]:
        """Analyze feasibility of the proposed solution"""
        issues = []
        content_lower = content.lower()
        
        # Check for unrealistic timelines
        if "week 1" in content_lower and "week 8" in content_lower:
            issues.append(Issue(
                type="feasibility",
                severity="medium",
                description="8-week timeline may be unrealistic for complex projects",
                location="general",
                suggestion="Consider extending timeline or breaking into phases"
            ))
        
        # Check for missing MVP definition
        if "mvp" not in content_lower and "minimum viable product" not in content_lower:
            issues.append(Issue(
                type="feasibility",
                severity="medium",
                description="MVP definition not clear",
                location="general",
                suggestion="Define minimum viable product features clearly"
            ))
        
        return issues
    
    def generate_improvements(self, issues: List[Issue]) -> List[str]:
        """Generate improvement suggestions based on issues"""
        suggestions = []
        
        # Group issues by type
        technical_issues = [i for i in issues if i.type == "technical"]
        security_issues = [i for i in issues if i.type == "security"]
        clarity_issues = [i for i in issues if i.type == "clarity"]
        feasibility_issues = [i for i in issues if i.type == "feasibility"]
        
        if technical_issues:
            suggestions.append("Technical: Specify exact technologies, versions, and architecture patterns")
        
        if security_issues:
            suggestions.append("Security: Add authentication, encryption, and compliance measures")
        
        if clarity_issues:
            suggestions.append("Clarity: Improve structure, simplify language, and add examples")
        
        if feasibility_issues:
            suggestions.append("Feasibility: Define realistic timelines and MVP scope")
        
        # Add specific suggestions
        for issue in issues:
            if issue.severity in ["high", "critical"]:
                suggestions.append(f"Priority: {issue.suggestion}")
        
        return suggestions
    
    def calculate_overall_score(self, issues: List[Issue]) -> float:
        """Calculate overall quality score (0-100)"""
        if not issues:
            return 100.0
        
        # Weight issues by severity
        severity_weights = {"low": 1, "medium": 2, "high": 3, "critical": 4}
        total_weight = sum(severity_weights.get(issue.severity, 1) for issue in issues)
        
        # Calculate score (higher weight = lower score)
        max_possible_weight = len(issues) * 4  # All critical issues
        score = max(0, 100 - (total_weight / max_possible_weight) * 100)
        
        return round(score, 1)
    
    def apply_improvements(self, content: str, issues: List[Issue], industry: str) -> str:
        """Apply improvements to the content"""
        improved_content = content
        
        # Add missing authentication if not mentioned
        if not any(auth in content.lower() for auth in self.tech_stack_patterns["auth"]):
            if "tech stack" in content.lower():
                improved_content = improved_content.replace(
                    "Tech Stack:",
                    "Tech Stack: Next.js, Node.js, PostgreSQL, Supabase (Auth + DB),"
                )
        
        # Add security considerations if missing
        if not any(security in content.lower() for security in self.security_keywords):
            if "## Technical Strategy" in content:
                improved_content = improved_content.replace(
                    "## Technical Strategy",
                    "## Technical Strategy\n**Security**: HTTPS, JWT authentication, data encryption, CORS protection"
                )
        
        # Add deployment strategy if missing
        if "deploy" not in content.lower():
            if "## Next Steps" in content:
                improved_content = improved_content.replace(
                    "## Next Steps",
                    "## Next Steps\n**Deployment**: Vercel (frontend) + Railway/Render (backend) + Supabase (database)"
                )
        
        # Add industry-specific compliance
        if industry == "fintech" and "pci" not in content.lower():
            if "## Risk Assessment" in content:
                improved_content = improved_content.replace(
                    "## Risk Assessment",
                    "## Risk Assessment\n**Compliance**: PCI DSS, SOX, GDPR, KYC/AML requirements"
                )
        elif industry == "healthcare" and "hipaa" not in content.lower():
            if "## Risk Assessment" in content:
                improved_content = improved_content.replace(
                    "## Risk Assessment",
                    "## Risk Assessment\n**Compliance**: HIPAA, FDA guidelines, HITECH Act"
                )
        
        return improved_content
    
    async def review_content(self, request: ReviewRequest) -> ReviewResponse:
        """Review and improve the writer output"""
        start_time = datetime.now()
        
        # Detect industry
        industry = self.detect_industry(request.writer_output.founder_report)
        
        # Analyze all content
        all_issues = []
        
        # Analyze founder report
        founder_issues = self.analyze_technical_correctness(request.writer_output.founder_report, industry)
        founder_issues.extend(self.analyze_security_compliance(request.writer_output.founder_report, industry))
        founder_issues.extend(self.analyze_clarity_readability(request.writer_output.founder_report))
        founder_issues.extend(self.analyze_feasibility(request.writer_output.founder_report))
        all_issues.extend(founder_issues)
        
        # Analyze other formats
        other_content = f"{request.writer_output.one_pager} {request.writer_output.pitch_ready} {request.writer_output.tweet}"
        other_issues = self.analyze_technical_correctness(other_content, industry)
        other_issues.extend(self.analyze_security_compliance(other_content, industry))
        all_issues.extend(other_issues)
        
        # Generate improvements
        suggestions = self.generate_improvements(all_issues)
        
        # Calculate overall score
        overall_score = self.calculate_overall_score(all_issues)
        
        # Apply improvements to content
        reviewed_founder_report = self.apply_improvements(request.writer_output.founder_report, all_issues, industry)
        reviewed_one_pager = self.apply_improvements(request.writer_output.one_pager, all_issues, industry)
        reviewed_pitch_ready = self.apply_improvements(request.writer_output.pitch_ready, all_issues, industry)
        reviewed_tweet = self.apply_improvements(request.writer_output.tweet, all_issues, industry)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return ReviewResponse(
            reviewed_founder_report=reviewed_founder_report,
            reviewed_one_pager=reviewed_one_pager,
            reviewed_pitch_ready=reviewed_pitch_ready,
            reviewed_tweet=reviewed_tweet,
            issues_found=all_issues,
            suggestions=suggestions,
            overall_score=overall_score,
            processing_time=processing_time,
            timestamp=datetime.now().isoformat()
        )

# Initialize Reviewer Agent
reviewer_agent = ReviewerAgent()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "capabilities": [
            "technical_correctness",
            "security_compliance",
            "clarity_readability",
            "feasibility_analysis"
        ],
        "supported_industries": ["fintech", "healthcare", "general"]
    }

@app.options("/review")
async def review_options():
    """Handle CORS preflight for review endpoint"""
    return {"message": "OK"}

@app.post("/review", response_model=ReviewResponse)
async def review_blueprint(request: ReviewRequest):
    """Review and improve AI-generated blueprint"""
    try:
        response = await reviewer_agent.review_content(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blueprint review failed: {str(e)}")

@app.post("/review/simple")
async def review_simple_blueprint(writer_output: dict):
    """Simple endpoint for quick blueprint review"""
    try:
        # Convert dict to WriterOutput
        writer_output_obj = WriterOutput(**writer_output)
        request = ReviewRequest(writer_output=writer_output_obj)
        response = await reviewer_agent.review_content(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blueprint review failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
