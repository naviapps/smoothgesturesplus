declare global {
  interface Window {
    find(
      query: string,
      caseSensitive?: boolean,
      backwards?: boolean,
      wrapAround?: boolean,
      wholeWord?: boolean,
      searchInFrames?: boolean,
      showDialog?: boolean,
    ): boolean;
  }
}

export {};
