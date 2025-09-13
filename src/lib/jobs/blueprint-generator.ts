import { aiBlueprintGenerator, GeneratedBlueprint } from '@/lib/ai/openai';

export interface BlueprintJob {
  id: string;
  blueprintId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  currentStep: string;
  error?: string;
  result?: GeneratedBlueprint;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory job storage (replace with database in production)
const jobs = new Map<string, BlueprintJob>();

export class BlueprintJobProcessor {
  private static instance: BlueprintJobProcessor;
  private processingQueue: string[] = [];
  private isProcessing = false;

  static getInstance(): BlueprintJobProcessor {
    if (!BlueprintJobProcessor.instance) {
      BlueprintJobProcessor.instance = new BlueprintJobProcessor();
    }
    return BlueprintJobProcessor.instance;
  }

  async createJob(blueprintId: string): Promise<string> {
    try {
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const job: BlueprintJob = {
        id: jobId,
        blueprintId,
        status: 'PENDING',
        progress: 0,
        currentStep: 'Initializing...',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jobs.set(jobId, job);
      this.processingQueue.push(jobId);
      
      // Start processing if not already running
      if (!this.isProcessing) {
        this.processQueue();
      }

      return jobId;
    } catch (error) {
      console.error('Failed to create job:', error);
      throw new Error(`Failed to create blueprint job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getJob(jobId: string): BlueprintJob | undefined {
    return jobs.get(jobId);
  }

  getJobByBlueprintId(blueprintId: string): BlueprintJob | undefined {
    for (const job of jobs.values()) {
      if (job.blueprintId === blueprintId) {
        return job;
      }
    }
    return undefined;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      const jobId = this.processingQueue.shift();
      if (!jobId) continue;

      const job = jobs.get(jobId);
      if (!job) continue;

      try {
        await this.processJob(job);
      } catch (error) {
        console.error(`Job ${jobId} failed:`, error);
        this.updateJobStatus(jobId, 'FAILED', 0, 'Failed', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    this.isProcessing = false;
  }

  private async processJob(job: BlueprintJob): Promise<void> {
    console.log(`Processing job ${job.id} for blueprint ${job.blueprintId}`);
    
    // Update job status to processing
    this.updateJobStatus(job.id, 'PROCESSING', 10, 'Starting blueprint generation...');

    try {
      // Get the blueprint data (this would come from database in production)
      const blueprintData = await this.getBlueprintData(job.blueprintId);
      if (!blueprintData) {
        throw new Error('Blueprint not found');
      }

      // Generate the complete blueprint using AI
      this.updateJobStatus(job.id, 'PROCESSING', 20, 'Generating market analysis...');
      const result = await aiBlueprintGenerator.generateCompleteBlueprint({
        idea: blueprintData.idea,
        title: blueprintData.title,
        description: blueprintData.description
      });

      // Update job with result
      this.updateJobStatus(job.id, 'COMPLETED', 100, 'Blueprint generation completed', undefined, result);
      
      // Update the blueprint in the database (this would be implemented with actual database)
      await this.updateBlueprintWithResult(job.blueprintId, result);

    } catch (error) {
      console.error(`Job ${job.id} processing failed:`, error);
      this.updateJobStatus(
        job.id, 
        'FAILED', 
        job.progress, 
        'Generation failed', 
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private updateJobStatus(
    jobId: string, 
    status: BlueprintJob['status'], 
    progress: number, 
    currentStep: string, 
    error?: string,
    result?: GeneratedBlueprint
  ): void {
    const job = jobs.get(jobId);
    if (!job) return;

    job.status = status;
    job.progress = progress;
    job.currentStep = currentStep;
    job.error = error;
    job.result = result;
    job.updatedAt = new Date();

    jobs.set(jobId, job);
  }

  private async getBlueprintData(blueprintId: string): Promise<{ idea: string; title: string; description: string } | null> {
    // This would fetch from database in production
    // For now, return mock data based on the blueprint ID
    return {
      idea: `A SaaS platform for restaurant inventory management (Blueprint ${blueprintId})`,
      title: "Restaurant Inventory Management SaaS",
      description: "A comprehensive inventory management platform for small restaurants"
    };
  }

  private async updateBlueprintWithResult(blueprintId: string, result: GeneratedBlueprint): Promise<void> {
    // This would update the database in production
    console.log(`Updating blueprint ${blueprintId} with generated result`);
  }
}

export const blueprintJobProcessor = BlueprintJobProcessor.getInstance();
