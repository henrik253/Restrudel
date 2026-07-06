setcpm(110/4)

$: s("bd ~ ~ bd ~ ~ sd ~").bank("RolandTR808").gain(.8)

$: s("hh*2 hh hh*2 hh").gain(.2)

$: n("<0 5 7 5>").scale("d:minor").s("saw")
  .lpf(2000).resonance(4).release(.4).room(.5).delay(.3).gain(.35)

$: n("0 ~ 3 ~ 5 ~ 7 ~").scale("d:minor").s("gm_synth_strings_1")
  .lpf(2500).room(.4).gain(.3)

$: n("<d2 d2 bb1 c2>").scale("d:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
