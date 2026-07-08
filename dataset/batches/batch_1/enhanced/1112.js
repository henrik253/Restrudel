setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ hh ~ hh").gain(.2)

$: n("0 3 7 5").scale("e:minor").s("gm_lead_6_voice")
  .lpf(2200).resonance(4).release(.2).delay(.3).gain(.4)

$: note("e2 c2 b1 a1").s("sawtooth").lpf(650)
  .resonance(2).gain(.45).release(.2)
