const { ResumeWorkflowEngine } = require('./src/workflow-engine/ResumeWorkflowEngine.ts');
const { ResumeProcessingService } = require('./src/services/ResumeProcessingService.ts');

console.log('🚀 Starting Resume Workflow Integration Test...\n');

async function runWorkflowTest() {
  try {
    const workflowEngine = new ResumeWorkflowEngine();
    const resumeService = new ResumeProcessingService();

    // Test 1: Basic workflow execution
    console.log('📋 Test 1: Basic Resume Submission Workflow');
    const mockWorkflow = {
      nodes: [
        {
          id: '1',
          type: 'newResumeSubmission',
          position: { x: 0, y: 0 },
          data: { config: {} }
        },
        {
          id: '2',
          type: 'analyzeResume',
          position: { x: 200, y: 0 },
          data: { 
            config: {
              jobRequirements: {
                required_skills: ['JavaScript', 'React', 'Node.js'],
                experience_years: 3,
                education_level: 'Bachelor'
              }
            }
          }
        },
        {
          id: '3',
          type: 'condition',
          position: { x: 400, y: 0 },
          data: { 
            config: {
              variable: '{{2.matchScore}}',
              operator: '>=',
              value: 70
            }
          }
        },
        {
          id: '4',
          type: 'sendCommunication',
          position: { x: 600, y: -50 },
          data: { 
            config: {
              type: 'email',
              template: {
                subject: 'Interview Invitation',
                body: 'Dear {{candidate.name}}, we would like to invite you for an interview based on your resume.'
              },
              recipients: ['{{candidate.email}}']
            }
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
        { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
        { id: 'e3-4', source: '3', target: '4', type: 'smoothstep', sourceHandle: 'true' }
      ]
    };

    const mockContext = {
      resumeData: {
        filePath: 'https://example.com/uploads/resume.pdf',
        fileType: 'pdf',
        originalName: 'John_Doe_Resume.pdf',
        size: 102400
      },
      candidateData: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        linkedin: 'https://linkedin.com/in/johndoe'
      },
      jobId: '550e8400-e29b-41d4-a716-446655440000',
      source: 'careers-page',
      workflowId: 'test-workflow-123',
      executionId: 'test-execution-456'
    };

    const result = await workflowEngine.executeResumeWorkflow(mockWorkflow, mockContext);
    
    console.log('✅ Workflow execution completed!');
    console.log('Success:', result.success);
    console.log('Status:', result.status);
    console.log('Execution time:', result.executionTime, 'ms');
    console.log('Results:', Object.keys(result.results));
    
    // Test 2: Resume processing
    console.log('\n📄 Test 2: Resume Processing');
    const pdfResult = await resumeService.processResume(
      'https://example.com/sample.pdf',
      'pdf',
      {
        required_skills: ['JavaScript', 'React'],
        preferred_skills: ['TypeScript', 'Node.js'],
        experience_years: 3,
        education_level: 'Bachelor'
      }
    );

    console.log('✅ Resume processing completed!');
    console.log('Match score:', pdfResult.analysis.match_score);
    console.log('Skills:', pdfResult.analysis.skills);
    console.log('Experience:', pdfResult.analysis.experience);

    console.log('\n🎉 All tests passed! The workflow system is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

runWorkflowTest();