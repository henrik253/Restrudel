setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ snare_rim:0 ~ snare_rim:0").gain(.3)

$: note("g5 b5 g5 e5").s("square")
  .lpf(2000).resonance(6).delay(.5).delayfeedback(.4).gain(.35)

$: note("b2 f#2 f2 bb2").s("sawtooth")
  .lpf(600).release(.3).gain(.5)
