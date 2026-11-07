import { Button, Icon } from "../../components";
import styles from "./Words.module.css";

/** Previous, where you are, next. */
export function ListPager({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  if (pages <= 1) return null;
  return (
    <nav className={styles.pager} aria-label="Páginas">
      <Button tone="neutral" variant="soft" iconOnly icon={<Icon name="back" size={20} />} aria-label="Página anterior" disabled={page <= 1} onClick={() => onPage(page - 1)} />
      <span>
        Página <b>{page}</b> de {pages}
      </span>
      <Button tone="neutral" variant="soft" iconOnly icon={<Icon name="next" size={20} />} aria-label="Página siguiente" disabled={page >= pages} onClick={() => onPage(page + 1)} />
    </nav>
  );
}
