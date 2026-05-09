import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface WorkerCardProps {
  id: string | number;
  name: string;
  photo?: string;
  rating?: number;
  reviews?: number;
  experience?: string;
  price?: number;
  skill?: string;
  location?: string;
  delay?: number;
}

const WorkerCard = ({
  id,
  name,
  photo,
  rating = 0,
  reviews = 0,
  experience = "",
  price,
  skill = "",
  location = "",
  delay = 0,
}: WorkerCardProps) => (
  <motion.div className="h-full" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}>
    <Link to={`/worker/${id}`} className="block h-full rounded-2xl glass glass-hover p-5 transition-colors">
      <div className="flex h-full min-h-[180px] flex-col">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
            <img src={photo || "/img/placeholder-avatar.png"} alt={name} className="h-full w-full object-cover" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-foreground">{name}</h3>
            <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {skill}
              {skill && location ? ` • ${location}` : location}
            </div>
            {experience && <div className="mt-1 text-xs text-muted-foreground">{experience}</div>}
          </div>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3">
            <div className="font-semibold">{price ? `Rs. ${price}` : "—"}</div>
            <div className="text-right text-xs text-muted-foreground">
              {rating.toFixed(1)} ★ ({reviews})
            </div>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default WorkerCard;
