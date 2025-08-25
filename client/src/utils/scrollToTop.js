/**
 * Utility function to scroll to the top of the page
 * @param {boolean} smooth - Whether to use smooth scrolling (default: true)
 */
export const scrollToTop = (smooth = true) => {
  if (smooth && 'scrollBehavior' in document.documentElement.style) {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  } else {
    // Fallback for older browsers
    window.scrollTo(0, 0);
  }
};

/**
 * Utility function to scroll to a specific element
 * @param {string} selector - CSS selector for the target element
 * @param {boolean} smooth - Whether to use smooth scrolling (default: true)
 */
export const scrollToElement = (selector, smooth = true) => {
  const element = document.querySelector(selector);
  if (element) {
    if (smooth && 'scrollBehavior' in document.documentElement.style) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      element.scrollIntoView();
    }
  }
};
