//   return (
//     <main className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-10 space-y-8 text-foreground">
//       {/* Header */}
//       <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div className="space-y-1">
//           <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
//             คำนวณคาร์บอนฟุตพรินท์
//           </h1>
//           <p className="text-sm md:text-base text-muted-foreground">
//             เลือกกิจกรรมของคุณ กรอกข้อมูล และดูผลคำนวณแบบเรียลไทม์
//           </p>
//         </div>

//         <div className="flex flex-wrap gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             className="gap-1 border-red-400/80 text-red-300 bg-black/30 hover:bg-red-500/20"
//             // className="gap-1 border-amber-400/80 text-amber-200 bg-black/30 hover:bg-amber-500/20"
//             onClick={handleResetAll}
//             disabled={resetting}
//           >
//             {resetting ? (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             ) : (
//               <RotateCcw className="w-4 h-4" />
//             )}
//             ล้างข้อมูลทั้งหมด
//           </Button>

//           <Button
//             variant="outline"
//             size="sm"
//             className="gap-1 border-sky-400/80 text-sky-200 bg-black/30 hover:bg-sky-500/20"
//             onClick={handleGoSummary}
//           >
//             <BarChart3 className="w-4 h-4" />
//             ดูผลสรุปทั้งหมด
//           </Button>

//           {/* <Button
//             size="sm"
//             className="gap-1 bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/40"
//             onClick={handleExportPdf}
//           >
//             <FileDown className="w-4 h-4" />
//             Export PDF
//           </Button> */}
//         </div>
//       </header>

//       {/* แบบฟอร์มกรอกข้อมูล */}
//       <Card className="border border-white/25 bg-black/30 backdrop-blur-sm rounded-3xl shadow-[0_0_0_1px_rgba(0,0,0,0.6)]">
//         <CardHeader>
//           <CardTitle className="text-xl md:text-2xl text-foreground">
//             แบบฟอร์มกรอกข้อมูล
//           </CardTitle>
//           <CardDescription className="text-sm md:text-base text-muted-foreground">
//             📌 เลือก Scope → เลือกกิจกรรม → กรอกข้อมูลให้ครบ แล้วกด{" "}
//             <span className="font-semibold text-emerald-300">เสร็จสิ้น</span>
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="space-y-10">
//           {/* Scope selector */}
//           <section className="space-y-2">
//             <Label className="text-sm uppercase tracking-wide text-foreground">
//               เลือก Scope
//             </Label>
//             {/* เพิ่ม div ตรงนี้ */}
//             <div className="mt-1">
//               <Select
//                 value={selectedScopeId ? String(selectedScopeId) : ""}
//                 onValueChange={(v) => handleSelectScope(v ? Number(v) : null)}
//               >
//                 <SelectTrigger className="w-full bg-black/40 border border-white/25">
//                   <SelectValue placeholder="เลือก Scope" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {scopes.map((s) => (
//                     <SelectItem key={s.scope_id} value={String(s.scope_id)}>
//                       {s.scope_name ?? `Scope ${s.scope_id}`}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* {selectedScopeId && (
//               <p className="text-xs text-muted-foreground mt-1">
//                 ตอนนี้อยู่ใน{" "}
//                 <span className="font-medium text-emerald-300">
//                   {scopeMap.get(selectedScopeId)?.scope_name ?? `Scope ${selectedScopeId}`}
//                 </span>
//               </p>
//             )} */}
//           </section>

//           <div className="h-px bg-white/80 my-6" />

//           {/* Activity selector */}
//           <section className="space-y-2">
//             <Label className="text-sm uppercase tracking-wide text-foreground">
//               เลือกกิจกรรม
//             </Label>

//             {loadingInitial ? (
//               <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 กำลังโหลดกิจกรรม...
//               </div>
//             ) : activitiesOfScope.length === 0 ? (
//               <p className="text-sm text-muted-foreground">ยังไม่มีกิจกรรมใน Scope นี้</p>
//             ) : (
//               <div className="mt-1">   {/* ← เพิ่มแค่ตรงนี้ */}
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                   {activitiesOfScope.map((act) => {
//                     const isSelected = act.activity_id === selectedActivityId
//                     return (
//                       <button
//                         key={act.activity_id}
//                         type="button"
//                         onClick={() => handleSelectActivity(act.activity_id)}
//                         className={[
//                           "rounded-2xl border px-3 py-3 text-left text-sm transition-all",
//                           "text-foreground hover:bg-emerald-500/10 hover:border-emerald-400",
//                           isSelected
//                             ? "border-emerald-400 bg-emerald-500/25 shadow-lg shadow-emerald-500/30"
//                             : "border-white/25 bg-black/30",
//                         ].join(" ")}
//                       >
//                         <div className="font-semibold">
//                           {act.activity_name ?? `Activity ${act.activity_id}`}
//                         </div>
//                       </button>
//                     )
//                   })}
//                 </div>
//               </div>
//             )}

//           </section>

//           <div className="h-px bg-white/80 my-6" />

//           {/* Dynamic fields */}
//           <section className="space-y-3">
//             <div className="flex items-center justify-between">
//               <h3 className="text-sm font-semibold text-foreground">
//                 รายละเอียดกิจกรรม
//               </h3>
//             </div>

//             {editingItem && editingItem.activityId === selectedActivityId && (
//               <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/70 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
//                 <div className="space-y-1">
//                   <p className="font-semibold">กำลังแก้ไขรายการเดิม</p>
//                   <p className="text-xs text-amber-50/80">
//                     {editingItem.scopeName} – {editingItem.activityName} | บันทึกเมื่อ{" "}
//                     {new Date(editingItem.submittedAt).toLocaleString()}
//                   </p>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="text-amber-50 hover:bg-amber-500/20"
//                   onClick={cancelEditing}
//                 >
//                   ยกเลิกการแก้ไข
//                 </Button>
//               </div>
//             )}

//             {!selectedActivityId ? (
//               <p className="text-sm text-muted-foreground">
//                 กรุณาเลือก Scope และ Activity ก่อน
//               </p>
//             ) : formFields.length === 0 ? (
//               <p className="text-sm text-muted-foreground">
//                 ยังไม่มีช่องกรอกสำหรับกิจกรรมนี้
//               </p>
//             ) : (
//               <div className="space-y-4">
//                 {formFields.map((field) => {
//                   const v = fieldValues[field.field_id] ?? {}
//                   const unitsForField = fieldUnitsMap[field.field_id] ?? []
//                   const isNumber = field.field_type === "number"
//                   const isDropdown = field.field_type === "dropdown"

//                   return (
//                     <div
//                       key={field.field_id}
//                       className="rounded-2xl border border-white/25 bg-black/30 px-3 py-3 space-y-2"
//                     >
//                       <div className="flex flex-wrap items-baseline justify-between gap-2">
//                         <div>
//                           <p className="text-sm font-medium text-foreground">
//                             {field.field_label}
//                           </p>
//                         </div>
//                         {typeof field.field_order === "number" && (
//                           <span className="text-[11px] text-muted-foreground">
//                             ลำดับที่ {field.field_order}
//                           </span>
//                         )}
//                       </div>

//                       {/* Control */}
//                       {isNumber && (
//                         <div className="grid grid-cols-[1.4fr,0.9fr] gap-2">
//                           <Input
//                             type="number"
//                             inputMode="decimal"
//                             placeholder="กรอกตัวเลข"
//                             className="bg-black/40 border border-white/25 placeholder:text-muted-foreground/60"
//                             value={v.valueNum ?? ""}
//                             onChange={(e) =>
//                               updateFieldValue(field.field_id, {
//                                 valueNum: e.target.value,
//                               })
//                             }
//                           />
//                           <Select
//                             value={v.unitId ?? ""}
//                             onValueChange={(val) =>
//                               updateFieldValue(field.field_id, {
//                                 unitId: val,
//                               })
//                             }
//                           >
//                             <SelectTrigger className="bg-black/40 border border-white/25">
//                               <SelectValue placeholder="เลือกหน่วย" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {unitsForField.length === 0 ? (
//                                 <SelectItem value="" disabled>
//                                   ยังไม่ได้กำหนดหน่วย
//                                 </SelectItem>
//                               ) : (
//                                 unitsForField.map((u) => (
//                                   <SelectItem key={u.unit_id} value={String(u.unit_id)}>
//                                     {u.symbol || u.code || u.name}
//                                   </SelectItem>
//                                 ))
//                               )}
//                             </SelectContent>
//                           </Select>
//                         </div>
//                       )}

//                       {isDropdown && (
//                         <Select
//                           value={v.optionId ?? ""}
//                           onValueChange={(val) =>
//                             updateFieldValue(field.field_id, {
//                               optionId: val,
//                             })
//                           }
//                         >
//                           <SelectTrigger className="bg-black/40 border border-white/25">
//                             <SelectValue placeholder="เลือกตัวเลือก" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {options
//                               .filter(
//                                 (o) =>
//                                   o.dropdown_group_key === field.dropdown_group_key &&
//                                   isActiveFlag(o),
//                               )
//                               .map((o) => (
//                                 <SelectItem key={o.option_id} value={String(o.option_id)}>
//                                   {o.display_name}
//                                 </SelectItem>
//                               ))}
//                           </SelectContent>
//                         </Select>
//                       )}

//                       {!isNumber && !isDropdown && (
//                         <Input
//                           placeholder="กรอกข้อความ"
//                           className="bg-black/40 border border-white/25 placeholder:text-muted-foreground/60"
//                           value={v.valueNum ?? ""}
//                           onChange={(e) =>
//                             updateFieldValue(field.field_id, {
//                               valueNum: e.target.value,
//                             })
//                           }
//                         />
//                       )}
//                     </div>
//                   )
//                 })}
//               </div>
//             )}
//           </section>

//           {/* Submit button */}
//           <div className="pt-2 flex justify-end">
//             <Button
//               className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 shadow-lg shadow-emerald-500/40"
//               size="lg"
//               onClick={handleSubmitActivity}
//               disabled={submitting || !selectedActivityId}
//             >
//               {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//               เสร็จสิ้น – บันทึกและคำนวณ
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {/* History */}
//       <section className="space-y-3">
//         <div className="flex items-center justify-between gap-2">
//           <div>
//             <h2 className="text-xl md:text-2xl font-semibold text-foreground">
//               ประวัติการคำนวณ
//             </h2>
//             {/* <p className="text-sm text-muted-foreground">
//               ทุกครั้งที่กด “เสร็จสิ้น” จะถูกบันทึกไว้ที่นี่ทันที แม้ภายหลัง Admin จะปิดการใช้งาน
//               Activity / Field แล้ว
//             </p> */}
//           </div>
//           <Button
//             variant="outline"
//             size="icon"
//             className="border border-white/25 bg-black/30"
//             onClick={reloadHistory}
//             disabled={loadingHistory}
//           >
//             {loadingHistory ? (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             ) : (
//               <RotateCcw className="w-4 h-4" />
//             )}
//           </Button>
//         </div>

//         <ScrollArea className="h-[420px] rounded-2xl border border-white/25 bg-black/20 px-3 py-3">
//           {loadingInitial || loadingHistory ? (
//             <div className="flex items-center justify-center h-full text-sm text-muted-foreground gap-2">
//               <Loader2 className="w-4 h-4 animate-spin" />
//               กำลังโหลดประวัติ...
//             </div>
//           ) : history.length === 0 ? (
//             <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
//               ยังไม่มีประวัติการคำนวณ
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {history.map((item) => (
//                 <div
//                   key={item.key}
//                   className="rounded-2xl border border-white/25 bg-black/30 px-4 py-3 space-y-2 shadow-sm"
//                 >
//                   <div className="flex flex-wrap items-start justify-between gap-2">
//                     <div className="space-y-0.5">
//                       <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">
//                         {item.scopeName}
//                       </p>
//                       <p className="text-sm md:text-base font-semibold text-foreground">
//                         {item.activityName}
//                       </p>
//                       <p className="text-[11px] text-muted-foreground">
//                         บันทึกเมื่อ{" "}
//                         {new Date(item.submittedAt).toLocaleString()}
//                       </p>
//                     </div>
//                     <div className="flex flex-col items-end gap-1">
//                       <p className="text-sm md:text-base font-semibold text-emerald-200">
//                         คาร์บอนที่เกิดขึ้น:{" "}
//                         <span className="text-emerald-100">
//                           {formatNumber(item.totalCo2eKg)} kg CO₂
//                         </span>
//                       </p>
//                       <div className="flex gap-2">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           className="h-8 px-3 gap-1 border-sky-400/80 text-sky-200 bg-black/30 hover:bg-sky-500/20"
//                           onClick={() => handleEditHistoryItem(item)}
//                         >
//                           <Edit3 className="w-3 h-3" />
//                           แก้ไข
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="destructive"
//                           className="h-8 px-3 gap-1"
//                           onClick={() => handleDeleteHistoryItem(item)}
//                         >
//                           <Trash2 className="w-3 h-3" />
//                           ลบ
//                         </Button>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="border-t border-white/25 pt-2 mt-1 space-y-1.5">
//                     {item.fields.map((f) => (
//                       <p key={f.fieldId} className="text-[13px] text-muted-foreground">
//                         <span className="font-medium text-foreground">{f.label}:</span>{" "}
//                         {f.displayValue}
//                       </p>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </ScrollArea>
//       </section>
//     </main>
//   )
// }