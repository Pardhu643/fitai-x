async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Simulated Gemini connection function with mock responses
async function simulateGenerateResponse(
  modelName: string, 
  attempt: number, 
  scenario: string
): Promise<string> {
  console.log(`[Simulation] Model: ${modelName} | Attempt: ${attempt}`);
  
  if (scenario === 'success_on_first') {
    return 'Gemini response: Success on first attempt!';
  }
  
  if (scenario === 'retry_then_success') {
    if (attempt === 1) {
      throw { status: 503, message: 'Service Unavailable' };
    }
    return 'Gemini response: Success on second attempt!';
  }
  
  if (scenario === 'three_failures') {
    throw { status: 503, message: 'Service Unavailable' };
  }
  
  if (scenario === 'primary_fail_fallback_success') {
    if (modelName === 'gemini-flash-latest') {
      throw { status: 503, message: 'Service Unavailable' };
    }
    return 'Gemini response: Success from fallback model!';
  }

  throw new Error('Unknown scenario');
}

async function runSimulation(scenario: string) {
  console.log(`\n==========================================`);
  console.log(`RUNNING SCENARIO: ${scenario}`);
  console.log(`==========================================`);
  
  const primaryModel = 'gemini-flash-latest';
  const fallbackModel = 'gemini-2.0-flash';
  const maxAttempts = 3;
  const delays = [0, 500, 1000]; // smaller delays for quick simulation

  let success = false;
  let reply = '';
  
  // Try Primary Model
  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (attempt > 1) {
        const delay = delays[attempt - 1];
        console.log(`[Simulation Retry] Delaying ${delay}ms before attempt ${attempt}...`);
        await sleep(delay);
      }
      try {
        reply = await simulateGenerateResponse(primaryModel, attempt, scenario);
        success = true;
        break;
      } catch (error: any) {
        console.log(`[Simulation Catch] Primary Attempt ${attempt} failed with status: ${error.status}`);
        if (attempt === maxAttempts) {
          break;
        }
      }
    }
    
    // Switch to Fallback if primary failed
    if (!success) {
      console.log(`[Simulation Fallback] Switching to fallback model: ${fallbackModel}`);
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (attempt > 1) {
          const delay = delays[attempt - 1];
          console.log(`[Simulation Fallback Retry] Delaying ${delay}ms before attempt ${attempt}...`);
          await sleep(delay);
        }
        try {
          reply = await simulateGenerateResponse(fallbackModel, attempt, scenario);
          success = true;
          break;
        } catch (error: any) {
          console.log(`[Simulation Catch] Fallback Attempt ${attempt} failed with status: ${error.status}`);
        }
      }
    }

    if (success) {
      console.log(`[Simulation RESULT] Success! Reply: ${reply}`);
    } else {
      console.log(`[Simulation RESULT] All attempts failed.`);
    }
  } catch (err: any) {
    console.log(`[Simulation RESULT] Unexpected error:`, err);
  }
}

async function main() {
  await runSimulation('success_on_first');
  await runSimulation('retry_then_success');
  await runSimulation('three_failures');
  await runSimulation('primary_fail_fallback_success');
}

main();
