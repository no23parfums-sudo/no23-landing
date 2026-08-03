type KitCardProps = {
  variant: "kit-one" | "kit-two";
  number: string;
  vialCount: number;
  category: string;
  title: string;
  description: string;
};

export function KitCard({
  variant,
  number,
  vialCount,
  category,
  title,
  description,
}: KitCardProps) {
  return (
    <article className={`kit-card ${variant}`}>
      <div className="kit-art">
        <span className="kit-number">{number}</span>
        <div className="vials">
          {Array.from({ length: vialCount }, (_, index) => (
            <i key={index}></i>
          ))}
        </div>
      </div>
      <div className="kit-info">
        <span>{category}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}
