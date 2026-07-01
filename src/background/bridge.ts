/**
 * Resolves the currently active tab in the last focused window.
 */
async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

interface ExecuteInTabOptions<TArgs extends any[], TResult> {
  tabId: number;
  func: (...args: TArgs) => TResult;
  args: TArgs;
}

/**
 * Executes a function in all frames of a given tab using chrome.scripting.executeScript.
 */
async function executeInTab<TArgs extends any[], TResult>({
  tabId,
  func,
  args,
}: ExecuteInTabOptions<TArgs, TResult>): Promise<TResult[]> {
  const executions = await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    func,
    args,
  });

  return executions.map((execution) => execution.result as TResult);
}
