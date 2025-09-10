interface Tip {
  text: string;
}

interface TipsSectionProps {
  title: string;
  tips: Tip[];
}

const TipsSection = ({ title, tips }: TipsSectionProps) => {
  return (
    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
      <h3 className="text-sm font-medium text-foreground mb-2">{title}</h3>
      <ul className="text-xs text-muted-foreground space-y-1">
        {tips.map((tip, index) => (
          <li key={index}>• {tip.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default TipsSection;