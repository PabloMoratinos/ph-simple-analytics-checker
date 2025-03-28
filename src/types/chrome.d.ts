
// Chrome namespace type definition for extension API
declare global {
  interface Window {
    chrome?: {
      tabs?: {
        query: (queryInfo: { active: boolean; currentWindow: boolean }) => Promise<any[]>;
        onUpdated?: {
          addListener: (callback: (tabId: number, changeInfo: any, tab: any) => void) => void;
          removeListener: (callback: (tabId: number, changeInfo: any, tab: any) => void) => void;
        };
      };
      scripting?: {
        executeScript: (options: { target: { tabId: number }; func: () => any }) => Promise<any>;
      };
      runtime?: {
        sendMessage: (message: any) => Promise<any>;
        onInstalled?: {
          addListener: (callback: () => void) => void;
        };
        onMessage?: {
          addListener: (callback: (message: any, sender: any, sendResponse: any) => void) => void;
          removeListener: (callback: (message: any, sender: any, sendResponse: any) => void) => void;
        };
      };
      sidePanel?: {
        setPanelBehavior: (options: { openPanelOnActionClick: boolean }) => Promise<void>;
        open?: () => Promise<void>;
      };
    };
  }
}

export {};
