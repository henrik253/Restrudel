setcpm(110/4)

$: note("<[g2,bb2,d3,f3] [c3,e3,g3,bb3] [f2,a2,c3,e3] [f2,a2,c3,e3]>")
  .s("sawtooth").lpf(900).release(.3).room(.4).gain(.3)

$: note("<g1 c2 f1 f1>").s("sawtooth").lpf(400).release(.2).gain(.5)

$: s("hh*4 ~ hh*2 hh").gain(.2)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.75)

$: note("e4 g4 c5 <g3 b3>").velocity(.43).s("square").lpf(2500).delay(.3).gain(.3)
