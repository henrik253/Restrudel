setcpm(116/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ shaker_small ~ shaker_small").gain(.2).room(.4)

$: n("0 3 7 5 7 3 0 ~").scale("a:minor").s("gm_lead_6_voice")
  .lpf(2000).release(.2).room(.4).gain(.4)

$: note("a2 f2 c3 g2").sound("sawtooth").lpf(700)
  .release(.2).gain(.5)
