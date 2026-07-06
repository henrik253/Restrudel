setcpm(110/4)

$: s("bd ~ bd ~").bank("RolandTR808").gain(.85)

$: s("~ hh ~ hh").gain(.18)

$: note("c1 f1 g1 c1").s("gm_epiano1:1").lpf(700)
  .gain("[.5 .3]*4").release(.2)

$: n("3 1 5 4 5 ~").scale("d:dorian").struct("[~ x]*2")
  .s("sawtooth").lpf(1600).sustain(.1).delay(.4).gain(.4)
