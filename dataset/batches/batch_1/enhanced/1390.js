setcpm(112/4)

$: s("bd ~ sd ~ bd bd sd ~").gain(.8)

$: s("cymbal ~ ~ ~").slow(2).gain(.25).room(.5)

$: note("e5 ~ c5 ~ f5 ~ e5 ~").s("gm_xylophone").release(.2).delay(.3).gain(.35)

$: note("c2 c2 g1 a1").s("sine").release(.2).gain(.55)

$: s("hh*8").gain(.15)
