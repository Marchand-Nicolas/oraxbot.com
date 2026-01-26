import React from "react";
import styles from "../../styles/components/ui/skeleton.module.css";

const Skeleton = ({ height, width, marginTop, marginBottom, marginRight }) => {
  return (
    <div
      className={`${styles.skeleton}`}
      style={{ height, width, marginTop, marginBottom, marginRight }}
    />
  );
};

export default Skeleton;
