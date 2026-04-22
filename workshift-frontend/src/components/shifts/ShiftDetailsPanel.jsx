function fmtTime(t) { return t ? String(t).substring(0, 5) : '—' }

export function ShiftDetailsPanel({
  selShift,
  isManager,
  activeTab,
  setActiveTab,
  pendingRegs,
  positions,
  reqs,
  loadingReqs,
  reqErr,
  reqPos,
  reqQty,
  addingReq,
  loadingPending,
  actioningId,
  members,
  assignErr,
  assignUserId,
  assignPosId,
  assignNote,
  assigning,
  onClose,
  onDeleteShift,
  onOpenLockShift,
  onSetRecommendModalState,
  onDelReq,
  onAddReq,
  setReqPos,
  setReqQty,
  onApprove,
  onReject,
  onAssign,
  setAssignUserId,
  setAssignPosId,
  setAssignNote,
  getMemberName,
  getPositionName,
}) {
  if (!selShift) return null

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline/10 shadow-lg overflow-hidden animate-[fadeIn_0.2s_ease-out]">
      <div className="px-6 py-4 bg-surface-container-low border-b border-outline/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">Ca làm việc: {selShift.name || 'Ca chưa đặt tên'}</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">{selShift.date} · {fmtTime(selShift.startTime)} – {fmtTime(selShift.endTime)}</p>
          </div>
          <div className="flex items-center gap-2">
            {isManager && selShift?.status === 'OPEN' && (
              <button onClick={onOpenLockShift} className="p-1.5 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors" title="Khóa ca làm việc (OPEN -> LOCKED)">
                <span className="material-symbols-outlined">lock</span>
              </button>
            )}
            {isManager && (
              <button onClick={() => onDeleteShift(selShift.id)} className="p-1.5 text-error hover:bg-error-container/20 rounded-lg transition-colors" title="Xóa ca làm việc này">
                <span className="material-symbols-outlined">delete</span>
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-outline/10">
          <button onClick={() => setActiveTab('requirements')} className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'requirements' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-t-lg'}`}>
            <span className="material-symbols-outlined text-[18px]">list_alt</span>
            Nhu cầu
          </button>
          {isManager && (
            <>
              <button onClick={() => setActiveTab('pending')} className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-t-lg'}`}>
                <span className="material-symbols-outlined text-[18px]">pending_actions</span>
                Chờ duyệt
                {pendingRegs.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-error text-on-error text-[10px] rounded-full">{pendingRegs.length}</span>}
              </button>
              <button onClick={() => setActiveTab('assign')} className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'assign' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-t-lg'}`}>
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Phân công thủ công
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'requirements' && (
          <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
            {loadingReqs ? (
              <p className="text-on-surface-variant animate-pulse text-center py-4">Đang tải...</p>
            ) : reqs.length > 0 ? (
              <div className="space-y-2">
                {reqs.map(req => (
                  <div key={req.id} className="flex items-center justify-between bg-surface-container rounded-xl px-4 py-3 group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ backgroundColor: req.positionColorCode || '#6366f1' }}>
                        {(req.positionName || '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-on-surface">{req.positionName || `#${req.positionId}`}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-on-surface bg-surface-container-lowest px-3 py-1 rounded-lg border border-outline/10">{req.quantity} người</span>
                      {isManager && selShift?.status === 'OPEN' && (
                        <button
                          onClick={() => onSetRecommendModalState({ shift: selShift, position: { positionId: req.positionId, positionName: req.positionName || `#${req.positionId}` } })}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/30 rounded-lg transition-all"
                          title="Gợi ý nhân viên theo vị trí"
                        >
                          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                        </button>
                      )}
                      {isManager && (
                        <button onClick={() => onDelReq(req.id)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-all opacity-0 group-hover:opacity-100" title="Xóa nhu cầu">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary-container/20 border border-primary/10 mt-4">
                  <span className="text-xs font-black uppercase tracking-widest text-primary">Tổng cộng</span>
                  <span className="text-base font-black text-primary">{reqs.reduce((s, r) => s + (r.quantity || 0), 0)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-surface-container-lowest rounded-2xl border border-dashed border-outline/20">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-20 mb-3">group_off</span>
                <p className="text-sm text-on-surface-variant font-medium">Chưa cấu hình nhu cầu nhân sự cho ca này</p>
              </div>
            )}

            {isManager && positions.length > 0 && (
              <form onSubmit={onAddReq} className="flex items-end gap-3 flex-wrap bg-surface-container-low p-4 rounded-xl border border-outline/10 mt-6">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Thêm vị trí</label>
                  <select value={reqPos} onChange={e => setReqPos(e.target.value)} className="w-full px-3 py-2 text-sm bg-surface-container-lowest rounded-lg border border-outline/20 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-all">
                    <option value="">— Chọn vị trí cần tuyển —</option>
                    {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Số lượng</label>
                  <input type="number" min={1} value={reqQty} onChange={e => setReqQty(e.target.value)} className="w-full px-3 py-2 text-sm text-center bg-surface-container-lowest rounded-lg border border-outline/20 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>
                <button type="submit" disabled={addingReq || !reqPos} className="px-4 py-2 bg-primary text-on-primary text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 h-[38px]">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  {addingReq ? 'Đang...' : 'Thêm'}
                </button>
              </form>
            )}
            {reqErr && <div className="bg-error-container/20 text-on-error-container rounded-lg p-3 text-sm">{reqErr}</div>}
          </div>
        )}

        {activeTab === 'pending' && isManager && (
          <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
            {loadingPending ? (
              <p className="text-on-surface-variant animate-pulse text-center py-4">Đang tải...</p>
            ) : pendingRegs.length > 0 ? (
              <div className="space-y-3">
                {pendingRegs.map(reg => (
                  <div key={reg.id} className="flex items-center justify-between bg-surface-container rounded-xl p-4 border border-outline/5 hover:border-outline/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container text-sm font-black shadow-inner">
                        {getMemberName(reg.userId).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{getMemberName(reg.userId)}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">Vị trí: <span className="font-semibold text-on-surface">{getPositionName(reg.positionId)}</span></p>
                        {reg.note && <p className="text-[11px] text-on-surface-variant italic mt-1 bg-surface-container-lowest px-2 py-1 rounded">📝 {reg.note}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onApprove(reg.id)} disabled={actioningId === reg.id} className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">check</span>
                        Duyệt
                      </button>
                      <button onClick={() => onReject(reg.id)} disabled={actioningId === reg.id} className="px-3 py-2 bg-surface-container-highest text-error text-sm font-bold rounded-lg hover:bg-error/10 transition-colors disabled:opacity-50">
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-surface-container-lowest rounded-2xl border border-dashed border-outline/20">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-20 mb-3">check_circle</span>
                <p className="text-sm text-on-surface-variant font-medium">Không có đăng ký nào cần duyệt!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'assign' && isManager && (
          <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-primary-container/10 p-4 rounded-xl border border-primary/20 flex gap-3">
              <span className="material-symbols-outlined text-primary">info</span>
              <p className="text-sm text-on-surface-variant leading-relaxed">Sử dụng tính năng này để điều động nhân sự vào ca làm việc kể cả khi họ chưa đăng ký. Bỏ qua bước chờ duyệt.</p>
            </div>

            {assignErr && <div className="bg-error-container/20 text-on-error-container rounded-lg p-3 text-sm">{assignErr}</div>}

            <form onSubmit={onAssign} className="bg-surface-container p-5 rounded-2xl space-y-4 border border-outline/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Nhân viên <span className="text-error">*</span></label>
                  <select value={assignUserId} onChange={e => setAssignUserId(e.target.value)} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-all">
                    <option value="">— Chọn Nhân Viên —</option>
                    {members.map(m => <option key={m.userId} value={m.userId}>{m.fullName || m.username}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Vị trí <span className="text-error">*</span></label>
                  <select value={assignPosId} onChange={e => setAssignPosId(e.target.value)} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-all">
                    <option value="">— Gán vào Vị Trí —</option>
                    {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Ghi chú điều động</label>
                <input type="text" value={assignNote} onChange={e => setAssignNote(e.target.value)} placeholder="Nhập ghi chú (tùy chọn)" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>
              <div className="pt-2 flex justify-end">
                <button type="submit" disabled={assigning || !assignUserId || !assignPosId} className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  {assigning ? 'Đang phân công...' : 'Phân Công Ngay'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
