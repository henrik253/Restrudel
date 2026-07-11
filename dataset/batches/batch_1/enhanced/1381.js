setcpm(130/4)

$: note("c2*8").s("square").lpf(700).resonance(4).release(.1).gain(.45)

$: n("3 6 0 2 5 5 6 ~").scale("c:minor").s("sawtooth").lpf(2900).hpf(400).velocity(.7).release(.15).gain(.35)

$: note("<[c4,eb4] [c#4,f4]>").s("square").lpf(1500).attack(.1).release(.3).gain(.2).room(.5)

$: s("bd*2 [~ bd] sd ~").bank("RolandTR909").gain(.8)

$: s("hh*16").gain("[.18 .1]*8")
