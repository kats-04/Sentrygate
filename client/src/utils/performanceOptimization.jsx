import React, { Suspense, lazy } from 'react';
import { SkeletonCard } from '../components/ui/Skeleton';

// Lazy load wrapper for components
export const lazyLoadComponent = (componentImport, displayName = 'LazyComponent') => {
  const Component = lazy(componentImport);

  const LazyWrapper = (props) => (
    <Suspense fallback={<SkeletonCard />}>
      <Component {...props} />
    </Suspense>
  );

  LazyWrapper.displayName = displayName;
  return LazyWrapper;
};

// Lazy load multiple components
export const createLazyComponents = (components) => {
  const lazyComponents = {};
  Object.entries(components).forEach(([name, importFn]) => {
    lazyComponents[name] = lazyLoadComponent(importFn, name);
  });
  return lazyComponents;
};

// Intersection Observer hook for lazy loading content
export const useIntersectionObserver = (ref, options = {}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.1,
      ...options,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return isVisible;
};

// Lazy load component on intersection
export const LazyLoadOnScroll = ({ children, fallback = null }) => {
  const ref = React.useRef(null);
  const isVisible = useIntersectionObserver(ref);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
};

// Image lazy loading with blur effect
export const LazyImage = ({ src, alt, className = '', blurDataURL }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState(blurDataURL || null);
  const imgRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          const img = new Image();
          img.onload = () => {
            setImageSrc(src);
            setImageLoaded(true);
          };
          img.src = src;
          if (imgRef.current) {
            observer.unobserve(imgRef.current);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`transition-all duration-300 ${imageLoaded ? 'blur-0' : 'blur-sm'} ${className}`}
    />
  );
};

// Batch updates to reduce re-renders
export const useBatchedState = (initialState) => {
  const [state, setState] = React.useState(initialState);
  const batchUpdatesRef = React.useRef(null);

  const batchUpdate = React.useCallback((updates) => {
    if (batchUpdatesRef.current) {
      clearTimeout(batchUpdatesRef.current);
    }

    batchUpdatesRef.current = setTimeout(() => {
      setState(prevState => ({
        ...prevState,
        ...updates,
      }));
    }, 100);
  }, []);

  return [state, batchUpdate];
};

// Debounced search
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Memoized expensive components
export const MemoizedComponent = React.memo(({ children, ...props }) => (
  <div {...props}>{children}</div>
));

MemoizedComponent.displayName = 'MemoizedComponent';

export default {
  lazyLoadComponent,
  createLazyComponents,
  useIntersectionObserver,
  LazyLoadOnScroll,
  LazyImage,
  useBatchedState,
  useDebounce,
  MemoizedComponent,
};
