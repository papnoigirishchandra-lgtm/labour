import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LucideIcon, Wrench } from "lucide-react";

interface ServiceCardProps {
  title: string;
  icon?: LucideIcon;
  description: string;
  delay?: number;
}

const ServiceCard = ({ title, icon: Icon = Wrench, description, delay = 0 }: ServiceCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="h-full"
  >
    <Link
      to={`/workers?service=${title.toLowerCase()}`}
      className="block h-full min-h-[210px] glass glass-hover rounded-2xl p-6 transition-all duration-300 group"
    >
      <div className="flex h-full flex-col">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors shrink-0">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-display font-semibold text-foreground mb-2 min-h-[3rem]">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground flex-1 leading-6">{description}</p>
      </div>
    </Link>
  </motion.div>
);

export default ServiceCard;
