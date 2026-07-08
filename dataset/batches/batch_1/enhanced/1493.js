setcpm(98/4)

$: n("<[0,2,4] [3,5,7] [4,6,8] [3,5,7]>").scale("c:major").s("gm_pad_warm").attack(.2).release(.6).room(.5).gain(.3)

$: n("~ 3 ~ 1").scale("c:major").s("piano").release(.3).gain(.35).delay(.3)

$: s("bd ~ sd ~ bd bd sd ~").gain(.75)

$: note("c2 ~ e2 ~ f2 ~ g2 ~").s("sine").release(.25).gain(.5)

$: s("hh*4").gain(.15)
