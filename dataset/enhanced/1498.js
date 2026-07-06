setcpm(88/4)

$: note("f4 c4 c4@2 a#3@2 ~ ~").s("sawtooth").lpf(1200).release(.3).room(.6).gain(.35)

$: n("2 -3 -1 1 -4 -1 ~ -5").scale("f:minor").s("piano").release(.4).gain(.3).room(.5)

$: note("f1 ~ f1 ab1 ~ f1 eb2 c2").s("square").lpf(450).release(.2).gain(.5)

$: s("bd ~ ~ bd sd ~ ~ ~").gain(.7).room(.3)

$: s("hh*4").gain(.12)
