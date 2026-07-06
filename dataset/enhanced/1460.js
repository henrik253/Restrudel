setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ oh ~ oh").hpf(4000).gain(.25).release(.05).room(.4)

$: note("c4*2 c4 ~").clip(.95).s("gm_lead_6_voice")
  .lpf(2500).release(.2).delay(.3).gain(.4)

$: n("<c2 c2 ab1 bb1>").scale("c:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
