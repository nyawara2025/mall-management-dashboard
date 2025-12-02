// Stub implementation for class-variance-authority
export type VariantProps<T> = T extends (props: infer P) => any ? P : never;

export function cva(baseClasses: string, options?: {
  variants?: Record<string, Record<string, string>>;
  defaultVariants?: Record<string, string>;
}) {
  return (props?: Record<string, string>) => {
    let classes = baseClasses;
    
    if (options?.variants && props) {
      for (const [variantName, variantClasses] of Object.entries(options.variants)) {
        const variantValue = props[variantName] || options.defaultVariants?.[variantName];
        if (variantValue && variantClasses[variantValue]) {
          classes += ' ' + variantClasses[variantValue];
        }
      }
    }
    
    if (props?.className) {
      classes += ' ' + props.className;
    }
    
    return classes;
  };
}
