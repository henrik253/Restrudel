setcpm(128/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .13]*4")

$: n("0 3 7 5").scale("g:minor").s("gm_lead_6_voice")
  .lpf(2200).resonance(4).release(.2).delay(.3).gain(.4)

$: note("g2 b1 d2 g2").s("sawtooth").lpf(200)
  .release(.15).gain(.45)
