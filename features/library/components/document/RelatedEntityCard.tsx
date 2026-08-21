"use client";

import { useRef, type PointerEvent } from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";
import {
  relatedEntityAsset,
  type RelatedEntityPresentation,
} from "../../lib/presentation";

const CATEGORY: Record<RelatedEntityPresentation["type"], string> = {
  perfumer: "Perfumer",
  brand: "Maison",
};

const MEDIA_SPRING = {
  stiffness: 280,
  damping: 32,
  mass: 0.8,
} as const;

type RelatedEntityCardProps = RelatedEntityPresentation;

function isFineHoverPointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/**
 * Master-template related discovery module.
 * Renders a link only when `href` is a real destination.
 */
export function RelatedEntityCard({
  type,
  name,
  image,
  asset,
  cta,
  href,
}: RelatedEntityCardProps) {
  const reduceMotion = useReducedMotion();
  const mediaRef = useRef<HTMLSpanElement>(null);
  const scale = useSpring(1, MEDIA_SPRING);
  const lift = useSpring(0, MEDIA_SPRING);
  const rotateX = useSpring(0, MEDIA_SPRING);
  const rotateY = useSpring(0, MEDIA_SPRING);
  const category = CATEGORY[type];
  const mediaAsset = relatedEntityAsset({ type, asset });
  const isPortrait = mediaAsset === "portrait";
  const label = `${category} ${name}. ${cta}.`;

  const restMedia = () => {
    scale.set(1);
    lift.set(0);
    rotateX.set(0);
    rotateY.set(0);
  };

  const engageMedia = () => {
    if (reduceMotion) return;
    scale.set(isPortrait ? 1.035 : 1.025);
    lift.set(isPortrait ? -2 : -1.5);
  };

  const onRowEnter = () => {
    if (!isFineHoverPointer()) return;
    engageMedia();
  };

  const onFocus = () => {
    engageMedia();
    rotateX.set(0);
    rotateY.set(0);
  };

  const onMediaMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (reduceMotion || !isPortrait || !isFineHoverPointer()) return;
    const node = mediaRef.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) return;
    const nx = ((event.clientX - box.left) / box.width) * 2 - 1;
    const ny = ((event.clientY - box.top) / box.height) * 2 - 1;
    rotateY.set(Math.max(-1.25, Math.min(1.25, nx * 1.25)));
    rotateX.set(Math.max(-0.75, Math.min(0.75, -ny * 0.75)));
  };

  const imageEl = image ? (
    <motion.img
      className="related-entity-card__image"
      src={image}
      alt=""
      draggable={false}
      style={
        isPortrait
          ? { scale, y: lift, rotateX, rotateY }
          : { scale, y: lift }
      }
    />
  ) : (
    <span className="related-entity-card__fallback" aria-hidden="true">
      {name.slice(0, 1)}
    </span>
  );

  const inner = (
    <span className="related-entity-card__body">
      <span
        ref={mediaRef}
        className="related-entity-card__media"
        data-asset={mediaAsset}
        onPointerMove={onMediaMove}
        onPointerLeave={() => {
          rotateX.set(0);
          rotateY.set(0);
        }}
      >
        {mediaAsset === "logo" ? (
          <span className="related-entity-card__plate">
            <span className="related-entity-card__mark">{imageEl}</span>
          </span>
        ) : (
          imageEl
        )}
      </span>
      <span className="related-entity-card__copy">
        <span className="related-entity-card__category">{category}</span>
        <span className="related-entity-card__name">{name}</span>
        <span className="related-entity-card__cta">
          <span className="related-entity-card__cta-label">{cta}</span>
          <span className="related-entity-card__arrow" aria-hidden="true">
            →
          </span>
        </span>
      </span>
    </span>
  );

  const shared = {
    className: "related-entity-card",
    "data-type": type,
    "data-asset": mediaAsset,
    "data-linked": href ? "true" : "false",
    "data-reduce-motion": reduceMotion ? "true" : "false",
    onMouseEnter: onRowEnter,
    onMouseLeave: restMedia,
    onFocus,
    onBlur: restMedia,
  } as const;

  if (href) {
    return (
      <a {...shared} href={href} aria-label={label}>
        {inner}
      </a>
    );
  }

  return (
    <article {...shared} aria-label={label} tabIndex={0}>
      {inner}
    </article>
  );
}
