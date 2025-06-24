import React, { useState } from "react";
import {
  Calendar,
  DollarSign,
  Info,
  User,
  MapPin,
  TrendingUp,
  PiggyBank,
} from "lucide-react";
import type { Database } from "../../types/database";
import { formatDate } from "../../utils/dateUtils";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface KPICardsProps {
  project: ProjectRow;
  readonly?: boolean;
}

export const KPICards: React.FC<KPICardsProps> = ({ project }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-gray-700 text-sm font-medium">Start Date</p>
            <p className="text-gray-900 font-bold text-lg">
              {formatDate(project.start_date) || "Not set"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-blue-700 text-sm font-medium">Desired Move-in</p>
            <p className="text-blue-900 font-bold text-lg">
              {formatDate(project.desired_move_in_date) || "Not set"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-purple-700 text-sm font-medium">Lease Value</p>
            <p className="text-purple-900 font-bold text-lg">
              $
              {project.expected_contract_value
                ? Number(project.expected_contract_value).toLocaleString()
                : "Not set"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-green-700 text-sm font-medium">
              Estimated Tenant Fee
            </p>
            <p className="text-green-900 font-bold text-lg">
              $
              {project.expected_fee
                ? Number(project.expected_fee).toLocaleString()
                : "Not set"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 relative">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
            <PiggyBank className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-orange-700 text-sm font-medium">
              Broker Commission
            </p>
            <p className="text-orange-900 font-bold text-lg">
              $
              {project.broker_commission
                ? Number(project.broker_commission).toLocaleString()
                : "Not set"}
            </p>
            {project.commission_paid_by && (
              <p className="text-sm font-semibold text-orange-700 mt-1">
                Paid by {project.commission_paid_by}
              </p>
            )}
          </div>
          {project.broker_commission && project.broker_commission > 0 && (
            <div
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
              {showTooltip && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-10">
                  <div className="space-y-1">
                    <div className="font-medium text-gray-300">
                      Commission Details:
                    </div>
                    <div>
                      • Amount: $
                      {Number(project.broker_commission).toLocaleString()}
                    </div>
                    <div>• Paid by: {project.commission_paid_by || "TBD"}</div>
                    <div>• Payment due: {project.payment_due || "TBD"}</div>
                  </div>
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-gray-700 text-sm font-medium">Head Count</p>
            <p className="text-gray-900 font-bold text-lg">
              {project.expected_headcount || "Not set"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
