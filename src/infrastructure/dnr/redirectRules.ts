/**
 * Dynamically sets up declarativeNetRequest rules to redirect local PDF loads to the viewer.
 * Dynamic rules allow us to use the runtime extension ID in the redirection URL.
 */
export async function setupDnrRules(): Promise<void> {
  const ruleId = 1;
  const targetRule: chrome.declarativeNetRequest.Rule = {
    id: ruleId,
    priority: 1,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
      redirect: {
        regexSubstitution: `chrome-extension://${chrome.runtime.id}/viewer.html?file=file://\\1`,
      },
    },
    condition: {
      regexFilter: '^file://(.*\\.pdf.*)$',
      resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
    },
  };

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [ruleId],
      addRules: [targetRule],
    });
    console.log('[margin:background] Dynamic DNR rules updated successfully');
  } catch (error) {
    console.error('[margin:background] Failed to update dynamic DNR rules:', error);
  }
}
