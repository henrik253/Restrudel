setcpm(110/4)

$: s("hh").gain(.75).room(.2)

$: s("hh*8").gain(.2).room(.3)

$: n("d#5@2 d5@2 c#5@7 ~ d#5@2 d5@2 ").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("c4@2 ~").scale("c2:minor").s("square").lpf(1800).resonance(4).gain(.4).release(.2)
