import styles from '../_styles/reservation.module.css';

export function Legend() {
  return (
    <div className={styles.legend}>
      <span>
        <i className={styles.swatchFree} /> müsait
      </span>
      <span>
        <i className={styles.swatchTaken} /> dolu
      </span>
    </div>
  );
}
