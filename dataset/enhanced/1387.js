setcpm(108/4)

$: note("<[c2 c2 g1 c2] [f2 f2 c2 f2] [g2 g2 d2 g2] [f2 f2 c2 f2]>")
  .s("square").lpf(500).release(.2).gain(.45)

$: n("0 2 4 ~ 7 4 2 ~").scale("c:major").s("gm_acoustic_guitar_steel:1").release(.3).room(.4).gain(.35)

$: s("hh*16").gain("[.22 .12]*8")

$: s("bd ~ sd ~").bank("AkaiLinn").gain(.75)
