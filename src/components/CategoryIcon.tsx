import React from 'react';
import {
  ShoppingCart,
  Utensils,
  Home,
  Zap,
  Car,
  ShoppingBag,
  Film,
  HeartPulse,
  Plane,
  BookOpen,
  ArrowUpRight,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  ArrowDownLeft,
  Tag,
  CreditCard,
  Building,
  HelpCircle
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = 'w-4 h-4' }) => {
  switch (iconName) {
    case 'ShoppingCart':
      return <ShoppingCart className={className} />;
    case 'Utensils':
      return <Utensils className={className} />;
    case 'Home':
      return <Home className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
    case 'Film':
      return <Film className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'Plane':
      return <Plane className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'ArrowUpRight':
      return <ArrowUpRight className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'Laptop':
      return <Laptop className={className} />;
    case 'TrendingUp':
      return <TrendingUp className={className} />;
    case 'Gift':
      return <Gift className={className} />;
    case 'ArrowDownLeft':
      return <ArrowDownLeft className={className} />;
    case 'CreditCard':
      return <CreditCard className={className} />;
    case 'Building':
      return <Building className={className} />;
    case 'Tag':
    default:
      return <Tag className={className} />;
  }
};
