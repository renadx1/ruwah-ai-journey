import { motion } from 'framer-motion';

interface HeritageCardProps {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
  delay?: number;
  color?: string;
}

export default function HeritageCard({ icon, title, description, onClick, delay = 0 }: HeritageCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={onClick}
      className="w-full bg-card hover:bg-secondary/80 border border-border rounded-2xl p-4 text-right transition-all active:scale-[0.97] shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div>
          <h3 className="font-heading font-semibold text-foreground text-sm">{title}</h3>
          <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{description}</p>
        </div>
        <span className="text-2xl flex-shrink-0">{icon}</span>
      </div>
    </motion.button>
  );
}
