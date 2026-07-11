setcpm(118/4)

$: note("d3 ~ [d3 f3] ~ ~ d3 ~ [c3 d3]").s("clavisynth").release(.15).gain(.4)

$: s("bd bd ~ sd ~ bd sd ~").gain(.8)

$: note("d2 ~ d2 ~ f2 ~ c2 ~").s("sawtooth").lpf(550).release(.15).gain(.5)

$: note("<[d3,f3,a3] [c3,e3,g3]>").s("gtr").slow(2).gain(.35).room(.4)

$: s("hh*8").gain(.15)
