export function NavigationMenu({ onSetHomePage }) {
  return (
    <div className="navigation-main-container">
      <ul className="navigation-list">
        <li className="navigation-item" onClick={() => onSetHomePage(true)}>
          My watchlist <i class="fas fa-film"></i>
        </li>
        <li className="navigation-item">
          Friends movies <i class="fas fa-user-friends  "></i>
        </li>
        <li className="navigation-item" onClick={() => onSetHomePage(false)}>
          Popular movies <i class="fas fa-fire-alt"></i>
        </li>
        <li className="navigation-item">Friend code - 23rew231</li>
      </ul>
    </div>
  );
}
