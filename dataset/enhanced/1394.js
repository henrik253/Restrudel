setcpm(100/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.75).room(.3)

$: s("shaker_small*8").gain(.2)

$: n("<0 2 4 [3 2]>").scale("f:major").s("gm_ocarina").release(.4).room(.7).delay(.5).gain(.3)

$: n("<[0,2] [-1,1]>").scale("f:major").s("gm_lead_6_voice").attack(.2).release(.6).gain(.2).room(.7)

$: note("f1 ~ c2 ~").s("sine").release(.3).gain(.5)
