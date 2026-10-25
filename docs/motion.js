// Animation et déplacements indépendants de la fréquence d'affichage.
export const STEP_DURATION_MS=142;
export const WALK_FRAME_MS=72;
export const WALK_FRAMES=8;

export function movementPosition(fromX,fromY,toX,toY,now,start,duration=STEP_DURATION_MS){
  const elapsed=Math.max(0,now-start);
  const t=Number.isFinite(elapsed)?Math.min(1,elapsed/duration):1;
  return {
    x:fromX+(toX-fromX)*t,
    y:fromY+(toY-fromY)*t,
    finished:t>=1
  };
}

export function characterPose(now,walking,walkStart=0){
  if(walking){
    const elapsed=Math.max(0,now-walkStart);
    const phase=elapsed*2*Math.PI/(WALK_FRAME_MS*WALK_FRAMES);
    const step=Math.abs(Math.sin(phase*2));
    return {
      frame:Math.floor(elapsed/WALK_FRAME_MS)%WALK_FRAMES,
      swayX:Math.sin(phase)*0.65,
      bobY:-1.5*step,
      scaleX:1-0.004*step,
      scaleY:1+0.007*step,
      shadowScale:1-0.045*step,
      chestRise:0,
      idleDriftX:0
    };
  }
  // Respiration plus lisible à 44 × 68 pixels, sans déplacer les pieds.
  // Le corps se déploie d'environ 3 pixels et oscille très légèrement.
  const breath=(Math.sin(now*2*Math.PI/1900)+1)/2;
  return {
    frame:0,
    swayX:Math.sin(now*2*Math.PI/3000)*0.9,
    bobY:0,
    scaleX:1-0.016*breath,
    scaleY:1+0.05*breath,
    shadowScale:1-0.06*breath,
    chestRise:Math.round(3*breath),
    idleDriftX:Math.round(Math.sin(now*2*Math.PI/3200))
  };
}
