setcpm(100/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.8).room(.2)

$: s("sleighbells ~ sleighbells ~").slow(2).gain(.25).room(.6)

$: note("a5 c6 e6 [~ g#5]").s("triangle").release(.2).delay(.4).gain(.25)

$: note("a2 ~ e2 g#2").s("gtr").release(.3).gain(.4)

$: note("a1 ~ ~ a1 ~ ~ e1 ~").s("sine").release(.25).gain(.5)
