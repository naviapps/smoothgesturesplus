import { ImageMessage, LinkMessage } from '@/types.ts';

export const stop = (): void => {
  window.stop();
};

export const gotoTop = (): void => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

export const gotoBottom = (): void => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth',
  });
};

export const pageUp = (): void => {
  window.scrollBy({
    top: -window.innerHeight * 0.8,
    behavior: 'smooth',
  });
};

export const pageDown = (): void => {
  window.scrollBy({
    top: window.innerHeight * 0.8,
    behavior: 'smooth',
  });
};

export const pageNext = (): void => {
  const rel = document.querySelector<HTMLLinkElement | HTMLAnchorElement>(
    'link[rel="next"][href], a[rel="next"][href]',
  );
  if (rel) {
    window.location.href = rel.href;
    return;
  }
  const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href]');
  for (let i = 0; i < anchors.length; i += 1) {
    const anchor = anchors[i];
    if (/(next|次|下一页)/i.test(anchor.innerText)) {
      window.location.href = anchor.href;
      return;
    }
  }
};

export const pagePrev = (): void => {
  const rel = document.querySelector<HTMLLinkElement | HTMLAnchorElement>(
    'link[rel="prev"][href], a[rel="prev"][href]',
  );
  if (rel) {
    window.location.href = rel.href;
    return;
  }
  const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href]');
  for (let i = 0; i < anchors.length; i += 1) {
    const anchor = anchors[i];
    if (/(prev|前|上一页)/i.test(anchor.innerText)) {
      window.location.href = anchor.href;
      return;
    }
  }
};

export const zoomImgIn = (images: ImageMessage[]): void => {
  images.forEach((image) => {
    const img = document.querySelector<HTMLImageElement>(`img[gestureid="${image.gestureid}"]`);
    if (!img) {
      return;
    }
    if (!img.getAttribute('origsize')) {
      img.setAttribute('origsize', `${img.clientWidth}x${img.clientHeight}`);
    }
    img.style.width = `${img.clientWidth * 1.2}px`;
    img.style.height = `${img.clientHeight * 1.2}px`;
  });
};

export const zoomImgOut = (images: ImageMessage[]): void => {
  images.forEach((image) => {
    const img = document.querySelector<HTMLImageElement>(`img[gestureid="${image.gestureid}"]`);
    if (!img) {
      return;
    }
    if (!img.getAttribute('origsize')) {
      img.setAttribute('origsize', `${img.clientWidth}x${img.clientHeight}`);
    }
    img.style.width = `${img.clientWidth / 1.2}px`;
    img.style.height = `${img.clientHeight / 1.2}px`;
  });
};

export const zoomImgZero = (images: ImageMessage[]): void => {
  images.forEach((image) => {
    const img = document.querySelector<HTMLImageElement>(`img[gestureid="${image.gestureid}"]`);
    if (!img) {
      return;
    }
    const origsize = img.getAttribute('origsize');
    if (!origsize) {
      return;
    }
    const size = origsize.split('x');
    img.style.width = `${size[0]}px`;
    img.style.height = `${size[1]}px`;
  });
};

export const hideImage = (images: ImageMessage[]): void => {
  images.forEach((image) => {
    const img = document.querySelector<HTMLImageElement>(`img[gestureid="${image.gestureid}"]`);
    if (!img) {
      return;
    }
    img.style.display = 'none';
  });
};

export const showCookies = (): void => {
  // eslint-disable-next-line no-alert
  window.alert(
    `Cookies stored by this host or domain:\n${`\n${document.cookie}`
      .replace(/; /g, ';\n')
      .replace(/\n(.{192})([^\\n]{5})/gm, '\n$1\n        $2')
      .replace(/\n(.{100})([^\\n]{5})/gm, '\n$1\n        $2')}`,
  );
};

export const print = (): void => {
  window.print();
};

export const copy = async (selection: string): Promise<void> => {
  await navigator.clipboard.writeText(selection);
};

export const copyLink = async (links: LinkMessage[]): Promise<void> => {
  await navigator.clipboard.writeText(links[0].src);
};

export const findPrev = async (selection: string): Promise<void> => {
  // TODO
};

export const findNext = async (selection: string): Promise<void> => {
  // TODO
};
