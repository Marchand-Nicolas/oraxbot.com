import React from "react";
import styles from "../../styles/components/ui/skeleton.module.css";

interface SkeletonProps {
  height?: string | number;
  width?: string | number;
  marginTop?: string | number;
  marginBottom?: string | number;
  marginRight?: string | number;
}

const Skeleton = ({
  height,
  width,
  marginTop,
  marginBottom,
  marginRight,
}: SkeletonProps) => {
  return (
    <div
      className={`${styles.skeleton}`}
      style={{ height, width, marginTop, marginBottom, marginRight }}
    />
  );
};

export default Skeleton;
