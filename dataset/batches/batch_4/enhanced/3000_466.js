setcpm(110/4)

$: s("oh*4 bd!3 bd*2 ~ ~").gain(.75).room(.2)

$: s("hh*8").gain(.2).room(.3)

$: n("2*8 5@7 ~ 5@2 5@2 5@2 5 ~ 5@2 5@2 5@2 4@10 3!2 4!2 4!2 4@2").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("4 5 7 5 4 2 0 ~").scale("c2:minor").s("square").lpf(1800).resonance(4).gain(.4).release(.2)

$: n("0").scale("c2:minor").s("sine").lpf(1200).room(.6).gain(.12).release(.4)

