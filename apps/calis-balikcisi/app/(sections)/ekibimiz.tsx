import { TEAM_MEMBERS } from './_team-data';
import { EkipVideoCard } from './_ekip-video-card';
import styles from './ekibimiz.module.css';

export function Ekibimiz() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className="eyebrow">Mutfağın Ardındakiler</span>
        <h2 className={styles.title}>Ekibimiz</h2>
        <div className={styles.titleRule} aria-hidden="true" />
      </div>

      <div className={styles.grid}>
        {TEAM_MEMBERS.map((m) => (
          <EkipVideoCard
            key={m.id}
            name={m.name}
            title={m.role}
            poster={m.poster}
            video={m.video}
          />
        ))}
      </div>
    </section>
  );
}
