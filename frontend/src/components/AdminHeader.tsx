'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import {
  IconShieldCheck,
  IconCoins,
  IconActivity,
  IconArrowLeft,
  IconExternalLink,
  IconCheckCircle,
} from '@/components/Icons';

export type AdminTab = 'overview' | 'quality' | 'finance';

interface AdminHeaderProps {
  activeTab: AdminTab;
  title?: string;
  badge?: string;
}

export default function AdminHeader({ activeTab, title, badge }: AdminHeaderProps) {
  const isSubPage = activeTab !== 'overview';

  return (
    <header
      style={{
        background: 'linear-gradient(180deg, #091932 0%, #061122 100%)',
        color: '#FFFFFF',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Top Bar Navigation */}
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '0 24px',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        {/* Left Section: Logo, Back Button & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Dedicated Back to Admin Overview Button if on Sub-page */}
          {isSubPage && (
            <Link
              href="/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#94A3B8',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.24)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = '#94A3B8';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
              title="Kembali ke Ikhtisar Admin Utama"
            >
              <IconArrowLeft size={16} />
              <span>Ikhtisar</span>
            </Link>
          )}

          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <Logo height={28} inverse />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                }}
              >
                ADMIN CONSOLE
              </span>
            </div>
          </Link>
        </div>

        {/* Middle Navigation Tabs (Overview, Quality, Finance) */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            gap: '4px',
          }}
        >
          {/* Tab 1: Ikhtisar / Portal Admin */}
          <Link
            href="/admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: activeTab === 'overview' ? 700 : 500,
              textDecoration: 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              backgroundColor: activeTab === 'overview' ? '#1E3A8A' : 'transparent',
              color: activeTab === 'overview' ? '#FFFFFF' : '#94A3B8',
              boxShadow: activeTab === 'overview' ? '0 2px 10px rgba(30, 58, 138, 0.5)' : 'none',
              border: activeTab === 'overview' ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid transparent',
            }}
          >
            <IconActivity size={15} color={activeTab === 'overview' ? '#93C5FD' : 'currentColor'} />
            <span>Ikhtisar Sistem</span>
          </Link>

          {/* Tab 2: Quality & Anti-Bot */}
          <Link
            href="/admin/quality"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: activeTab === 'quality' ? 700 : 500,
              textDecoration: 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              backgroundColor: activeTab === 'quality' ? '#1E3A8A' : 'transparent',
              color: activeTab === 'quality' ? '#FFFFFF' : '#94A3B8',
              boxShadow: activeTab === 'quality' ? '0 2px 10px rgba(30, 58, 138, 0.5)' : 'none',
              border: activeTab === 'quality' ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid transparent',
            }}
          >
            <IconShieldCheck size={15} color={activeTab === 'quality' ? '#93C5FD' : 'currentColor'} />
            <span>Quality & Anti-Bot</span>
          </Link>

          {/* Tab 3: Finance & Payout */}
          <Link
            href="/admin/finance"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: activeTab === 'finance' ? 700 : 500,
              textDecoration: 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              backgroundColor: activeTab === 'finance' ? '#1E3A8A' : 'transparent',
              color: activeTab === 'finance' ? '#FFFFFF' : '#94A3B8',
              boxShadow: activeTab === 'finance' ? '0 2px 10px rgba(30, 58, 138, 0.5)' : 'none',
              border: activeTab === 'finance' ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid transparent',
            }}
          >
            <IconCoins size={15} color={activeTab === 'finance' ? '#93C5FD' : 'currentColor'} />
            <span>Finance & Pencairan</span>
          </Link>
        </nav>

        {/* Right Section: System Indicator & User Dashboard Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Status Indicator Pill */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 500,
              color: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              padding: '4px 10px',
              borderRadius: '20px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
            className="hidden-mobile-flex"
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 8px #10B981',
                display: 'inline-block',
              }}
            />
            <span>Gateway Operasional</span>
          </div>

          {/* User App Switcher */}
          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              padding: '7px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#F1F5F9',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
            }}
            title="Keluar ke Dashboard Pengguna"
          >
            <span>Aplikasi Pengguna</span>
            <IconExternalLink size={13} color="#94A3B8" />
          </Link>
        </div>
      </div>

      {/* Sub-header Breadcrumb & Quick Actions Bar (if subpage) */}
      {isSubPage && (
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            backgroundColor: 'rgba(5, 15, 30, 0.5)',
            padding: '8px 24px',
          }}
        >
          <div
            style={{
              maxWidth: '1360px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8' }}>
              <Link
                href="/admin"
                style={{
                  color: '#60A5FA',
                  textDecoration: 'none',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <IconArrowLeft size={13} />
                Portal Admin
              </Link>
              <span>/</span>
              <span style={{ color: '#E2E8F0', fontWeight: 600 }}>
                {activeTab === 'quality' ? 'Quality & Anti-Bot Moderation' : 'Finance & Disbursement'}
              </span>
            </div>

            {/* Direct sibling switch shortcut */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {activeTab === 'quality' ? (
                <Link
                  href="/admin/finance"
                  style={{
                    color: '#93C5FD',
                    textDecoration: 'none',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Beralih ke Finance Panel</span>
                  <span>→</span>
                </Link>
              ) : (
                <Link
                  href="/admin/quality"
                  style={{
                    color: '#93C5FD',
                    textDecoration: 'none',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Beralih ke Quality Review</span>
                  <span>→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
