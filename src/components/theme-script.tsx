/** Prevents flash of wrong theme before React hydrates */
export function ThemeScript() {
  const code = `
(function() {
  try {
    var t = localStorage.getItem('weightle-theme');
    var root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (t === 'light') root.classList.add('light');
    else root.classList.add('dark');
  } catch (e) {}
})();
`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
