export function useBodyClasses(): void {
  if (process.env.CLIENT && window.navigator.standalone) {
    document.body.classList.add('standalone');
  }
}
